namespace Dokie.Attributes;

[AttributeUsage(AttributeTargets.Parameter)]
public class ExampleAttribute(string value) : Attribute
{
    public string Value { get; } = value;
}