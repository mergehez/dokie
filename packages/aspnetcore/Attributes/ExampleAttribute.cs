namespace Dokie.Attributes;

[AttributeUsage(AttributeTargets.Parameter | AttributeTargets.Property)]
public class ExampleAttribute(string value) : Attribute
{
    public string Value { get; } = value;
}
