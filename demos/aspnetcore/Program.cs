using Microsoft.OpenApi;
using Dokie;

var builder = WebApplication.CreateBuilder(args);

var services = builder.Services;

services.AddOpenApi("v1", options =>
{
    options.OpenApiVersion = OpenApiSpecVersion.OpenApi3_0;
    options.AddDokie();
});

var app = builder.Build();


app.MapGet("/", () =>
{
    return Results.Redirect("/dokie");
});


app.MapGet("/hello", () =>
{
    return Results.Ok(new
    {
        Message = $"Hello from the Dokie ASP.NET Core demo using .NET v{Environment.Version}!",
    });
});

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseDokie("v1", new DokieOptions
    {
        Title = "Dokie",
        PredefinedHeaders = new Dictionary<string, string>
        {
            { "x-api-key", "" },
            { "Content-Type", "application/json" },
        },
    });
}

app.Run();