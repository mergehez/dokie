using System.Reflection;
using System.Text.Json;
using Dokie.Attributes;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi.Any;

namespace Dokie;

public struct DokieOptions
{
    public string Title { get; init; }
    public List<string>? HostnameOptions { get; init; }
    public Dictionary<string, string>? PredefinedVariables { get; init; }
    public Dictionary<string, string>? PredefinedHeaders { get; init; }
    public Dictionary<string, string>? Postscripts { get; init; }
    public List<string>? PredefinedFavoriteEndpoints { get; init; }
    public Func<object, string>? JsonSerialize { get; init; }
}

public static class Extensions
{
    private static readonly JsonSerializerOptions JsonSerializerOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    };

    private static string Serialize(object obj, DokieOptions? opts)
    {
        return opts?.JsonSerialize?.Invoke(obj) ?? JsonSerializer.Serialize(obj, JsonSerializerOptions);
    }

    /// <summary>
    /// Find all parameters with <see cref="ExampleAttribute"/> and add them to the OpenAPI document as examples.
    /// </summary>
    public static OpenApiOptions AddDokie(this OpenApiOptions options)
    {
        return options.AddOperationTransformer((a, ctx, _) =>
        {
            foreach (var pd in ctx.Description.ParameterDescriptions)
            {
                if (pd.ParameterDescriptor is not ControllerParameterDescriptor cpd || cpd.ParameterInfo.GetCustomAttribute<ExampleAttribute>() is not { } exAttr)
                    continue;
                var x = a.Parameters?.FirstOrDefault(t => t.Name == pd.Name);
                if (x is not null)
                    x.Example = new OpenApiString(exAttr.Value);
            }

            return Task.CompletedTask;
        });
    }

    public static void UseDokie(this WebApplication app, string documentName, DokieOptions? options = null)
    {
        app.MapGet("/dokie", (IHttpContextAccessor httpContextAccessor) =>
        {
            const string resourceName = "Dokie.wwwroot.dokie.html";
            var assembly = typeof(Extensions).GetTypeInfo().Assembly;
            using var stream = assembly.GetManifestResourceStream(resourceName);
            if (stream == null)
                throw new InvalidOperationException($"Could not find embedded resource: {resourceName}");

            using var reader = new StreamReader(stream);
            var html = reader.ReadToEnd();

            var opts = options ?? new DokieOptions();
            const string toReplace = "<script>/*inject-area*/</script>";
            var r = httpContextAccessor.HttpContext?.Request;
            var currentHostname = "";
            if (r is not null)
                currentHostname = r.Scheme + "://" + r.Host;

            var finalHtml = html.Replace(
                toReplace,
                $$"""
                      <script>
                          window.dokie = {
                              currentHostname: "{{currentHostname}}",
                              documentName: "{{documentName}}", 
                              hostnames: {{Serialize(opts.HostnameOptions ?? [], opts)}},
                              variables: {{Serialize(opts.PredefinedVariables ?? [], opts)}},
                              headers: {{Serialize(opts.PredefinedHeaders ?? [], opts)}},
                              postscripts: {{Serialize(opts.Postscripts ?? [], opts)}},
                              favorites: {{Serialize(opts.PredefinedFavoriteEndpoints ?? [], opts)}},
                          };
                      </script>
                  """
            );

            if (!string.IsNullOrWhiteSpace(opts.Title))
                finalHtml = finalHtml.Replace("<title>Dokie</title>", $"<title>{opts.Title}</title>");

            return Results.Content(finalHtml, "text/html");
        });
    }
}