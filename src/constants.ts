export const TERRASCAN_IAC_TYPES: string[] = ["cft", "k8s", "terraform", "tfplan"];
export const IAC_TYPE_QUICK_PICK_PLACEHOLDER: string = 'Pick an IaC type';

export const TERRASCAN_PROVIDER_TYPES: string[] = ["AWS", "AZURE", "GCP", "K8S", "GITHUB", "DOCKER"];
export const PROVIDER_TYPE_QUICK_PICK_PLACEHOLDER: string = 'Pick a provider type';

export const DOWNLOADING_REGO_EDITOR_TOOLS = 'Downloading RegoEditor tools';
export const REGO_EDITOR_TOOLS_DOWNLOAD_SUCCESS = 'Rego Editor tools downloaded successfully';
export const REGO_EDITOR_TOOLS_DOWNLOAD_FAILURE = 'Rego Editor tools download failed. ';

export const REGO_EDITOR_TOOLS_NOT_INSTALLED = 'Rego Editor tools not installed';

export const INSTALL_OPTION = "Install";
export const DISABLE_OPTION = "Disable";
export const ENABLE_OPTION = "Enable";

export const EXT_JSON = ".json";
export const EXT_REGO = ".rego";

export const REGO_HELPER_TEMPLATE_PROMPT = 'The rego file contains template code. Do you wish to disable it?';
export const DO_NOT_PROMPT_OPTION = "Don't ask again";
export const ENABLE_DISABLE_REGO_HELPER_TEMPLATE = "Enable/Diable Rego helper template";

export const REGO_HELPER_TEMPLATE = `# Full Rego Documentation: https://www.openpolicyagent.org/docs/latest/
# 'input' keyword is used to read the config
# To access nested variables use the dot notation
# e.g. : input.variable.name
# To access any value from an array use [index] after the array name
# e.g. : input.array[1]
# The [_] index allows is used to handle arrays in a single line.
# If used in an assignment expression (x := y[_]), x's value will be the array (y[_])
# If used in a comparison expression (y[_].name = x), the entire condition will be true if there exists at least one document in y for which the comparison is true.`;

export const TERRASCAN_VERSION = "v1.8.1";


// REGO EDITOR COMMANDS
export const COMMAND_GENERATE_CONFIG = "regoeditor.generateConfig";
export const COMMAND_GENERATE_REGO = "regoeditor.generateRego";
export const COMMAND_SCAN = "regoeditor.scan";
export const COMMAND_CONFIGURE = "regoeditor.configure";
export const COMMAND_SYNC = "regoeditor.sync";
export const COMMAND_DOWNLOAD_POLICY = "regoeditor.download";
export const COMMAND_FETCH_ALL_CUSTOM_RULES = "regoeditor.fetchall";