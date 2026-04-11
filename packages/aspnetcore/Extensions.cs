using System.Reflection;
using System.Text.Json;
#if NET10_0_OR_GREATER
using System.Text.Json.Nodes;
#endif
using Dokie.Attributes;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.AspNetCore.OpenApi;
#if NET10_0_OR_GREATER
using Microsoft.OpenApi;
#endif
#if !NET10_0_OR_GREATER
using Microsoft.OpenApi.Any;
#endif

namespace Dokie;

public struct DokieOptions
{
    public string Title { get; init; }
    public List<string>? HostnameOptions { get; init; }
    public Dictionary<string, string>? PredefinedVariables { get; init; }
    public Dictionary<string, string>? PredefinedHeaders { get; init; }
    public Dictionary<string, string>? PredefinedPostscripts { get; init; }
    public Dictionary<string, string>? PredefinedBodies { get; init; }
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
                {
#if NET10_0_OR_GREATER
                    switch (x)
                    {
                        case OpenApiParameter parameter:
                            parameter.Example = JsonValue.Create(exAttr.Value);
                            break;
                        case OpenApiParameterReference parameterReference when parameterReference.RecursiveTarget is not null:
                            parameterReference.RecursiveTarget.Example = JsonValue.Create(exAttr.Value);
                            break;
                    }
#else
                    x.Example = new OpenApiString(exAttr.Value);
#endif
                }
            }

            return Task.CompletedTask;
        });
    }

    public static void UseDokie(this WebApplication app, string documentName, DokieOptions? options = null)
    {
        app.MapGet("/dokie", (HttpContext httpContext) =>
        {
            const string resourceName = "Dokie.wwwroot.dokie.html";
            var assembly = typeof(Extensions).GetTypeInfo().Assembly;
            using var stream = assembly.GetManifestResourceStream(resourceName);
            if (stream == null)
                throw new InvalidOperationException($"Could not find embedded resource: {resourceName}");

            using var reader = new StreamReader(stream);
            var html = reader.ReadToEnd();

            var opts = options ?? new DokieOptions();
            var r = httpContext.Request;
            var currentHostname = "";
            if (r is not null)
                currentHostname = r.Scheme + "://" + r.Host;

            var finalHtml = html.Replace(
                "/*dokie-inject-area*/",
                $$"""
                    window.dokie = {
                        currentHostname: "{{currentHostname}}",
                        openApiJsonUrl: "{{currentHostname}}/openapi/{{documentName}}.json",
                        hostnames: {{Serialize(opts.HostnameOptions ?? [], opts)}},
                        variables: {{Serialize(opts.PredefinedVariables ?? [], opts)}},
                        headers: {{Serialize(opts.PredefinedHeaders ?? [], opts)}},
                        postscripts: {{Serialize(opts.PredefinedPostscripts ?? [], opts)}},
                        bodies: {{Serialize(opts.PredefinedBodies ?? [], opts)}},
                        favorites: {{Serialize(opts.PredefinedFavoriteEndpoints ?? [], opts)}},
                    };
                  """
            );

            if (!string.IsNullOrWhiteSpace(opts.Title))
                finalHtml = finalHtml.Replace("<title>Dokie</title>", $"<title>{opts.Title}</title>");

            return Results.Content(finalHtml, "text/html");
        });
    }
}