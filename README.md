# Terrascan Rego Editor

Create and test Rego policies for Terrascan in Visual Studio Code.

## Features

- Generates standardized JSON configuration used as input to Terrascan's policy engine.
- Generates a pre-populated Rego template using parameters from resources in your IaC files as input.
- Tests Rego policies against IaC files.
- Ability to sync policies with [Tenable.cs](https://www.tenable.com/products/tenable-cs).

![Terrascan Rego Editor demo](assets/terrascan-rego-editor-demo.gif)

## Getting Started
Follow these steps to get started:

1. Install the extension from the [VS code marketplace](https://marketplace.visualstudio.com/items?itemName=accuricsinc.terrascan-rego-editor)
2. Open an IaC template on VS Code.
3. Highlight an IaC resource, right-click, and select `RegoEditor: Generate Config`.
4. Select the IaC engine this template uses (e.g. terraform, cft, k8s, etc.). This generates a normalized JSON file including the highlighted resource and its parameters.
5. Right-click the normalized JSON file and select `RegoEditor:  Generate Rego`. This creates a rule JSON and a Rego file.
6. Update relevant fields on the Rule JSON file according to your policy.
7. Update the Rego file to enforce your policy.
8. Right-click the Rego file and click on `RegoEditor: Scan` to test your policy.

This extension supports multiple configuration options. To view the settings, open the command palette (`Ctrl + Shift + P` for Windows or `CMD + Shift + P` on Mac OS) and search for `RegoEditor: Configuration`.

From the configuration menu you should be able to customize:
- The counter suffixed to policies
- The default cloud provider
- Whether to show the helper text on newly created Rego files
- Credentials for syncing policies with [Tenable.cs](https://www.tenable.com/products/tenable-cs)

## Contributing

Contributions are always welcome in the form of documentation, blogs, issues, and pull requests. More details on [CONTRIBUTING.md](CONTRIBUTING.md).
