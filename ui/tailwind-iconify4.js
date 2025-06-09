import plugin from 'tailwindcss/plugin';
import {getIconsCSSData} from '@iconify/utils/lib/css/icons';
import {matchIconName} from '@iconify/utils/lib/icon/name';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {generateItemCSSRules, getCommonCSSRules,} from '@iconify/utils/lib/css/common';
import {defaultIconProps} from '@iconify/utils/lib/icon/defaults';
import {parseIconSet} from '@iconify/utils/lib/icon-set/parse';
import {calculateSize} from '@iconify/utils/lib/svg/size';

/**
 * Get CSS rules for main plugin (components)
 */
export function getCSSComponentsForPlugin(options) {
    const rules = Object.create(null);
    // Variable name, default to 'svg' (cannot be empty string)
    const varName = options.varName || 'svg';
    // Scale icons
    const scale = options.scale ?? 1;
    const adjustScale = (obj) => {
        if (!scale) {
            // Delete width and height
            delete obj['width'];
            delete obj['height'];
        } else if (scale !== 1) {
            // Set custom width and height
            obj['width'] = scale + 'em';
            obj['height'] = scale + 'em';
        }
        return obj;
    };
    // Add common rules
    const maskSelector = options.maskSelector ?? '.iconify';
    const backgroundSelector = options.backgroundSelector ?? '.iconify-color';
    if (maskSelector) {
        rules[maskSelector] = adjustScale(getCommonCSSRules({
            displayMode: 'mask',
            varName,
        }));
    }
    if (backgroundSelector) {
        rules[backgroundSelector] = adjustScale(getCommonCSSRules({
            displayMode: 'background',
            varName,
        }));
    }
    return rules;
}

/**
 * Get CSS rules for main plugin (utilities)
 */
export function getCSSRulesForPlugin(options) {
    const rules = Object.create(null);
    // Variable name, default to 'svg' (cannot be empty string)
    const varName = options.varName || 'svg';
    // Add icon sets
    const iconSelector = options.iconSelector || '.{prefix}--{name}';
    // Make icons square
    const square = options.square !== false;
    // Scale
    const scale = options.scale ?? 1;
    options.prefixes?.forEach((item) => {
        let prefix;
        let iconSet;
        let iconsList;
        let customise;
        // Load icon set
        if (typeof item === 'string') {
            // Prefix
            prefix = item;
            iconSet = loadIconSet(prefix);
        } else if (item.source) {
            // Source, possibly with prefix
            iconSet = loadIconSet(item.source);
            prefix = item.prefix || iconSet?.prefix;
            iconsList = item.icons;
            customise = item.customise;
            if (!prefix) {
                throw new Error('Custom icon set does not have a prefix. Please set "prefix" property');
            }
        } else {
            // Prefix
            prefix = item.prefix || iconSet?.prefix;
            iconSet = prefix ? loadIconSet(prefix) : undefined;
            iconsList = item.icons;
            customise = item.customise;
        }
        // Validate it
        if (!iconSet) {
            throw new Error(`Cannot load icon set for "${prefix}". Install "@iconify-json/${prefix}" as dev dependency?`);
        }
        if (!prefix) {
            throw new Error('Bad icon set entry, must have either "prefix" or "source" set');
        }
        // Load icons
        parseIconSet(iconSet, (name, data) => {
            // Check if icon should be rendered
            if (iconsList) {
                if (Array.isArray(iconsList)) {
                    if (!iconsList.includes(name)) {
                        return;
                    }
                } else if (!iconsList(name)) {
                    return;
                }
            }
            // Customise icon
            const body = customise ? customise(data.body, name) : data.body;
            // Generate CSS
            const iconRules = generateItemCSSRules({
                ...defaultIconProps,
                ...data,
                body,
            }, {
                displayMode: 'mask', // not used because varName is set, but required
                varName,
                forceSquare: square,
            });
            // Generate selector
            const selector = iconSelector
                .replace('{prefix}', prefix)
                .replace('{name}', name);
            // Scale non-square icons
            if (!square && scale > 0 && scale !== 1 && iconRules.width) {
                iconRules.width = calculateSize(iconRules.width, scale);
            }
            // Add to rules
            rules[selector] = iconRules;
        });
    });
    // Return
    return rules;
}

/**
 * Try to resolve file
 */
function resolveFile(filename) {
    try {
        return fileURLToPath(import.meta.resolve(filename));
    } catch (err) {
        //
    }
    try {
        return require.resolve(filename);
    } catch (err) {
        //
    }
}

export function locateIconSet(prefix) {
    // Try `@iconify-json/{$prefix}`
    const main = resolveFile(`@iconify-json/${prefix}/icons.json`);
    if (main) {
        const info = resolveFile(`@iconify-json/${prefix}/info.json`);
        if (info) {
            return {
                main,
                info,
            };
        }
    }
    // Try `@iconify/json`
    const full = resolveFile(`@iconify/json/json/${prefix}.json`);
    if (full) {
        return {
            main: full,
        };
    }
}

/**
 * Cache for loaded icon sets
 *
 * Tailwind CSS can send multiple separate requests to plugin, this will
 * prevent same data from being loaded multiple times.
 *
 * Key is filename, not prefix!
 */
const cache = Object.create(null);

/**
 * Load icon set from file
 */
function loadIconSetFromFile(source) {
    try {
        const result = JSON.parse(readFileSync(source.main, 'utf8'));
        if (!result.info && source.info) {
            // Load info from a separate file
            result.info = JSON.parse(readFileSync(source.info, 'utf8'));
        }
        return result;
    } catch {
        //
    }
}

/**
 * Load icon set from source
 */
export function loadIconSet(source) {
    if (typeof source === 'function') {
        // Callback
        return source();
    }
    if (typeof source === 'object') {
        // IconifyJSON
        return source;
    }
    // String
    // Try to parse JSON
    if (source.startsWith('{')) {
        try {
            return JSON.parse(source);
        } catch {
            // Invalid JSON
        }
    }
    // Check for cache
    if (cache[source]) {
        return cache[source];
    }
    // Icon set prefix
    if (source.match(matchIconName)) {
        const filename = locateIconSet(source);
        if (filename) {
            // Load icon set
            const result = loadIconSetFromFile(filename);
            if (result) {
                cache[source] = result;
            }
            return result;
        }
    }
    // Filename
    const result = loadIconSetFromFile({
        main: source,
    });
    if (result) {
        cache[source] = result;
    }
    return result;
}

/**
 * Get dynamic CSS rules
 */
export function getDynamicCSSRules(icon, options = {}) {
    const nameParts = icon.split(/--|:/);
    if (icon.includes('&#45;'))
        return {};
    if (nameParts.length !== 2) {
        throw new Error(`Invalid icon name: "${icon}"`);
    }
    const [prefix, name] = nameParts;
    if (!(prefix.match(matchIconName) && name.match(matchIconName))) {
        throw new Error(`Invalid icon name: "${icon}"`);
    }
    const iconSet = loadIconSet(options.iconSets?.[prefix] || prefix);
    if (!iconSet) {
        throw new Error(`Cannot load icon set for "${prefix}". Install "@iconify-json/${prefix}" as dev dependency?`);
    }
    const generated = getIconsCSSData(iconSet, [name], {
        iconSelector: '.icon',
    });
    if (generated.css.length !== 1) {
        throw new Error(`Cannot find "${icon}". Bad icon name?`);
    }
    const scale = options.scale ?? 1;
    if (scale) {
        generated.common.rules.height = scale + 'em';
        generated.common.rules.width = scale + 'em';
    } else {
        delete generated.common.rules.height;
        delete generated.common.rules.width;
    }
    return {
        // Common rules
        ...(options.overrideOnly || !generated.common?.rules
            ? {}
            : generated.common.rules),
        // Icon rules
        ...generated.css[0].rules,
    };
}

function getBooleanValue(value, defaultValue) {
    switch (value) {
        case true:
        case '1':
        case 'true':
            return true;
        case false:
        case '0':
        case 'false':
            return false;
    }
    return defaultValue ?? false;
}

function getFloatValue(value, defaultValue) {
    if (typeof value === 'number') {
        return value;
    }
    if (typeof value === 'string') {
        // Parse string
        const num = parseFloat(value);
        return isNaN(num) ? defaultValue : num;
    }
    return defaultValue;
}

/**
 * @type {PluginWithOptions<any>}
 */
const exportedPlugin = plugin.withOptions((params) => {
    // Clean up options
    const dynamicOptions = {};
    const preparsedOptions = {};
    Object.entries(params ?? {}).forEach(([key, value]) => {
        switch (key) {
            // Options for dynamic plugin
            case 'prefix':
                if (value === false) {
                    // Empty prefix: disables plugin
                    dynamicOptions.prefix = '';
                }
                if (typeof value === 'string') {
                    dynamicOptions.prefix = value;
                }
                return;
            case 'overrideOnly':
            case 'override-only':
            case 'overrideonly':
                dynamicOptions.overrideOnly = getBooleanValue(value, dynamicOptions.overrideOnly ?? false);
                return;
            // Options for preparsed plugin
            case 'prefixes': {
                // prefixes: foo;
                if (typeof value === 'string') {
                    preparsedOptions.prefixes = [value];
                    return;
                }
                // prefixes: foo, bar;
                if (Array.isArray(value)) {
                    preparsedOptions.prefixes = value;
                    return;
                }
                return;
            }
            case 'iconSelector':
            case 'icon-selector':
            case 'iconselector':
                if (typeof value === 'string') {
                    preparsedOptions.iconSelector = value;
                }
                return;
            case 'maskSelector':
            case 'mask-selector':
            case 'maskselector':
                if (typeof value === 'string') {
                    preparsedOptions.maskSelector = value;
                }
                return;
            case 'backgroundSelector':
            case 'background-selector':
            case 'backgroundselector':
                if (typeof value === 'string') {
                    preparsedOptions.backgroundSelector = value;
                }
                return;
            case 'varName':
            case 'var-name':
            case 'varname':
                if (typeof value === 'string') {
                    preparsedOptions.varName = value;
                }
                return;
            case 'square':
                preparsedOptions.square = getBooleanValue(value, preparsedOptions.square ?? true);
                return;
            // Common options
            case 'scale': {
                const scale = getFloatValue(value, dynamicOptions.scale ?? 1);
                dynamicOptions.scale = scale;
                preparsedOptions.scale = scale;
                return;
            }
            case 'force-brackets':
            case 'forceBrackets': {
                dynamicOptions.forceBrackets = getBooleanValue(value, dynamicOptions.forceBrackets ?? true);
            }
        }
    });
    return ({matchComponents, addComponents, addUtilities}) => {
        // Dynamic plugin
        const prefix = dynamicOptions.prefix ?? 'icon';


        if (prefix) {
            let values = undefined;
            if (dynamicOptions.forceBrackets === false) {
                const target = {};

                const handler = {
                    get(target, prop, receiver) {
                        if (!prop.includes('--'))
                            return undefined;
                        if (prop.startsWith('-'))
                            prop = prop.substring(1);
                        if (prop.startsWith('['))
                            prop = prop.substring(1);
                        if (prop.endsWith(']'))
                            prop = prop.substring(0, prop.length - 1);
                        return prop;
                    }
                };
                values = new Proxy(target, handler);
            }

            matchComponents({
                [prefix]: (icon) => {
                    try {
                        return getDynamicCSSRules(icon, dynamicOptions);
                    } catch (err) {
                        // Log error, but do not throw it
                        console.warn(err.message);
                        return {};
                    }
                },
            }, {
                values
            });
        }
        // Preparsed options
        if (preparsedOptions.prefixes) {
            addComponents(getCSSComponentsForPlugin(preparsedOptions));
            addUtilities(getCSSRulesForPlugin(preparsedOptions));
        }
    };
});
export default exportedPlugin;
