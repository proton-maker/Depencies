const MILLENNIUM_IS_CLIENT_MODULE = true;
const pluginName = "core";
function InitializePlugins() {
    var _a, _b;
    /**
     * This function is called n times depending on n plugin count,
     * Create the plugin list if it wasn't already created
     */
    (_a = (window.PLUGIN_LIST || (window.PLUGIN_LIST = {})))[pluginName] || (_a[pluginName] = {});
    (_b = (window.MILLENNIUM_PLUGIN_SETTINGS_STORE || (window.MILLENNIUM_PLUGIN_SETTINGS_STORE = {})))[pluginName] || (_b[pluginName] = {});
    window.MILLENNIUM_SIDEBAR_NAVIGATION_PANELS || (window.MILLENNIUM_SIDEBAR_NAVIGATION_PANELS = {});
    /**
     * Accepted IPC message types from Millennium backend.
     */
    let IPCType;
    (function (IPCType) {
        IPCType[IPCType["CallServerMethod"] = 0] = "CallServerMethod";
    })(IPCType || (IPCType = {}));
    let MillenniumStore = window.MILLENNIUM_PLUGIN_SETTINGS_STORE[pluginName];
    let IPCMessageId = `Millennium.Internal.IPC.[${pluginName}]`;
    let isClientModule = MILLENNIUM_IS_CLIENT_MODULE;
    const ComponentTypeMap = {
        DropDown: ['string', 'number', 'boolean'],
        NumberTextInput: ['number'],
        StringTextInput: ['string'],
        FloatTextInput: ['number'],
        CheckBox: ['boolean'],
        NumberSlider: ['number'],
        FloatSlider: ['number'],
    };
    MillenniumStore.ignoreProxyFlag = false;
    function DelegateToBackend(pluginName, name, value) {
        return MILLENNIUM_BACKEND_IPC.postMessage(IPCType.CallServerMethod, {
            pluginName,
            methodName: '__builtins__.__update_settings_value__',
            argumentList: { name, value },
        });
    }
    async function ClientInitializeIPC() {
        /** Wait for the MainWindowBrowser to not be undefined */
        while (typeof MainWindowBrowserManager === 'undefined') {
            await new Promise((resolve) => setTimeout(resolve, 0));
        }
        MainWindowBrowserManager?.m_browser?.on('message', (messageId, data) => {
            if (messageId !== IPCMessageId) {
                return;
            }
            const { name, value } = JSON.parse(data);
            MillenniumStore.ignoreProxyFlag = true;
            MillenniumStore.settingsStore[name] = value;
            DelegateToBackend(pluginName, name, value);
            MillenniumStore.ignoreProxyFlag = false;
        });
    }
    if (isClientModule) {
        ClientInitializeIPC();
    }
    const StartSettingPropagation = (name, value) => {
        if (MillenniumStore.ignoreProxyFlag) {
            return;
        }
        if (isClientModule) {
            DelegateToBackend(pluginName, name, value);
            /** If the browser doesn't exist yet, no use sending anything to it. */
            if (typeof MainWindowBrowserManager !== 'undefined') {
                MainWindowBrowserManager?.m_browser?.PostMessage(IPCMessageId, JSON.stringify({ name, value }));
            }
        }
        else {
            /** Send the message to the SharedJSContext */
            SteamClient.BrowserView.PostMessageToParent(IPCMessageId, JSON.stringify({ name, value }));
        }
    };
    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }
    const DefinePluginSetting = (obj) => {
        return new Proxy(obj, {
            set(target, property, value) {
                if (!(property in target)) {
                    throw new TypeError(`Property ${String(property)} does not exist on plugin settings`);
                }
                const settingType = ComponentTypeMap[target[property].type];
                const range = target[property]?.range;
                /** Clamp the value between the given range */
                if (settingType.includes('number') && typeof value === 'number') {
                    if (range) {
                        value = clamp(value, range[0], range[1]);
                    }
                    value || (value = 0); // Fallback to 0 if the value is undefined or null
                }
                /** Check if the value is of the proper type */
                if (!settingType.includes(typeof value)) {
                    throw new TypeError(`Expected ${settingType.join(' or ')}, got ${typeof value}`);
                }
                target[property].value = value;
                StartSettingPropagation(String(property), value);
                return true;
            },
            get(target, property) {
                if (property === '__raw_get_internals__') {
                    return target;
                }
                if (property in target) {
                    return target[property].value;
                }
                return undefined;
            },
        });
    };
    MillenniumStore.DefinePluginSetting = DefinePluginSetting;
    MillenniumStore.settingsStore = DefinePluginSetting({});
}
InitializePlugins()
const __call_server_method__ = (methodName, kwargs) => Millennium.callServerMethod(pluginName, methodName, kwargs)
const __wrapped_callable__ = (route) => MILLENNIUM_API.callable(__call_server_method__, route)
let PluginEntryPointMain = function() { var millennium_main = (function (exports, jsxRuntime, client, React) {
    'use strict';

    function _interopNamespaceDefault(e) {
        var n = Object.create(null);
        if (e) {
            Object.keys(e).forEach(function (k) {
                if (k !== 'default') {
                    var d = Object.getOwnPropertyDescriptor(e, k);
                    Object.defineProperty(n, k, d.get ? d : {
                        enumerable: true,
                        get: function () { return e[k]; }
                    });
                }
            });
        }
        n.default = e;
        return Object.freeze(n);
    }

    var React__namespace = /*#__PURE__*/_interopNamespaceDefault(React);

    /**
     * appends a virtual CSS script into self module
     * @param systemColors SystemAccentColors
     */
    const DispatchSystemColors = (systemColors) => {
        window.PLUGIN_LIST[pluginName].systemColor = `
    :root {
        --SystemAccentColor: ${systemColors.accent};
        --SystemAccentColor-RGB: ${systemColors.accentRgb};
        --SystemAccentColorLight1: ${systemColors.light1};
        --SystemAccentColorLight1-RGB: ${systemColors.light1Rgb};
        --SystemAccentColorLight2: ${systemColors.light2};
        --SystemAccentColorLight2-RGB: ${systemColors.light2Rgb};
        --SystemAccentColorLight3: ${systemColors.light3};
        --SystemAccentColorLight3-RGB: ${systemColors.light3Rgb};
        --SystemAccentColorDark1: ${systemColors.dark1};
        --SystemAccentColorDark1-RGB: ${systemColors.dark1Rgb};
        --SystemAccentColorDark2: ${systemColors.dark2};
        --SystemAccentColorDark2-RGB: ${systemColors.dark2Rgb};
        --SystemAccentColorDark3: ${systemColors.dark3};
        --SystemAccentColorDark3-RGB: ${systemColors.dark3Rgb};
    }`;
        window.PLUGIN_LIST[pluginName].systemColors = systemColors;
    };

    /**
     * Interpolates and overrides default patches on a theme.
     * @param incomingPatches Preprocessed list of patches from a specific theme
     * @returns Processed patches, interpolated with default patches
     */
    function parseTheme(incomingPatches) {
        let patches = {
            Patches: [
                { MatchRegexString: '^Steam$', TargetCss: 'libraryroot.custom.css', TargetJs: 'libraryroot.custom.js' },
                { MatchRegexString: '^OverlayBrowser_Browser$', TargetCss: 'libraryroot.custom.css', TargetJs: 'libraryroot.custom.js' },
                { MatchRegexString: '^SP Overlay:', TargetCss: 'libraryroot.custom.css', TargetJs: 'libraryroot.custom.js' },
                { MatchRegexString: 'Menu$', TargetCss: 'libraryroot.custom.css', TargetJs: 'libraryroot.custom.js' },
                { MatchRegexString: 'Supernav$', TargetCss: 'libraryroot.custom.css', TargetJs: 'libraryroot.custom.js' },
                { MatchRegexString: '^notificationtoasts_', TargetCss: 'libraryroot.custom.css', TargetJs: 'libraryroot.custom.js' },
                { MatchRegexString: '^SteamBrowser_Find$', TargetCss: 'libraryroot.custom.css', TargetJs: 'libraryroot.custom.js' },
                { MatchRegexString: '^OverlayTab\\d+_Find$', TargetCss: 'libraryroot.custom.css', TargetJs: 'libraryroot.custom.js' },
                { MatchRegexString: '^Steam Big Picture Mode$', TargetCss: 'bigpicture.custom.css', TargetJs: 'bigpicture.custom.js' },
                { MatchRegexString: '^QuickAccess_', TargetCss: 'bigpicture.custom.css', TargetJs: 'bigpicture.custom.js' },
                { MatchRegexString: '^MainMenu_', TargetCss: 'bigpicture.custom.css', TargetJs: 'bigpicture.custom.js' },
                { MatchRegexString: '.friendsui-container', TargetCss: 'friends.custom.css', TargetJs: 'friends.custom.js' },
                { MatchRegexString: '.ModalDialogPopup', TargetCss: 'libraryroot.custom.css', TargetJs: 'libraryroot.custom.js' },
                { MatchRegexString: '.FullModalOverlay', TargetCss: 'libraryroot.custom.css', TargetJs: 'libraryroot.custom.js' },
            ],
        };
        let newMatchRegexStrings = new Set(incomingPatches.map((patch) => patch.MatchRegexString));
        let filteredPatches = patches.Patches.filter((patch) => !newMatchRegexStrings.has(patch.MatchRegexString));
        return filteredPatches.concat(incomingPatches);
    }
    /**
     * parses a theme after it has been received from the backend.
     * - checks for failure in theme parse
     * - calculates what patches should be used relative to UseDefaultPatches
     * @param theme ThemeItem
     * @returns void
     */
    function ParseLocalTheme(theme) {
        if (theme?.failed) {
            window.PLUGIN_LIST[pluginName].isDefaultTheme = true;
            return;
        }
        theme?.data?.UseDefaultPatches && (theme.data.Patches = parseTheme(theme?.data?.Patches ?? []));
        window.PLUGIN_LIST[pluginName].activeTheme = theme;
    }

    /**
     * ==================================================
     *   _____ _ _ _             _
     *  |     |_| | |___ ___ ___|_|_ _ _____
     *  | | | | | | | -_|   |   | | | |     |
     *  |_|_|_|_|_|_|___|_|_|_|_|_|___|_|_|_|
     *
     * ==================================================
     *
     * Copyright (c) 2025 Project Digitaldepot
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in all
     * copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     * SOFTWARE.
     */
    const Logger = {
        Error: (...message) => {
            console.error('%c Digitaldepot ', 'background: red; color: white', ...message);
        },
        Log: (...message) => {
            console.log('%c Digitaldepot ', 'background: purple; color: white', ...message);
        },
        Warn: (...message) => {
            console.warn('%c Digitaldepot ', 'background: orange; color: white', ...message);
        },
        Debug: (...message) => {
            console.debug('%c Digitaldepot ', 'background: blue; color: white', ...message);
        },
    };

    /**
     * appends a virtual CSS script into self module
     * @param globalColors V1 Global Colors struct
     */
    const DispatchGlobalColors = (globalColors) => {
        window.PLUGIN_LIST[pluginName].GlobalsColors = `
    :root {
        ${globalColors.map((color) => `${color.ColorName}: ${color.HexColorCode};`).join(' ')}
    }`;
    };

    /**
     * ==================================================
     *   _____ _ _ _             _
     *  |     |_| | |___ ___ ___|_|_ _ _____
     *  | | | | | | | -_|   |   | | | |     |
     *  |_|_|_|_|_|_|___|_|_|_|_|_|___|_|_|_|
     *
     * ==================================================
     *
     * Copyright (c) 2025 Project Digitaldepot
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in all
     * copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     * SOFTWARE.
     */
    const DEFAULT_THEME_NAME = '__default__';
    const ChangeTheme = __wrapped_callable__('theme_config.change_theme');
    const FindAllThemes = __wrapped_callable__('find_all_themes');
    const FindAllPlugins = __wrapped_callable__('find_all_plugins');
    const UpdatePluginStatus = __wrapped_callable__('ChangePluginStatus');
    /**
     * steam://Digitaldepot URL support.
     *
     * Example:
     * "steam://Digitaldepot/settings" -> Open Digitaldepot dialog
     * "steam://Digitaldepot/settings/general" -> Open Digitaldepot dialog
     * "steam://Digitaldepot/settings/updates" -> Open the "Updates" tab
     * "steam://Digitaldepot/settings/themes/disable" -> Use default theme
     * "steam://Digitaldepot/settings/themes/enable/aerothemesteam" -> Enable the Office 2007 theme using its internal name
     * "steam://Digitaldepot/settings/plugins/disable/steam-db" -> Disable the SteamDB plugin using its internal name
     * "steam://Digitaldepot/settings/plugins/disable" -> Disable all plugins
     * "steam://Digitaldepot/settings/devtools/open" -> Open the DevTools window
     */
    const OnRunSteamURL = async (_, url) => {
        const [context, action, option, parameter] = url
            .replace(/^steam:\/{1,2}/, '/')
            .split('/')
            .filter((r) => r)
            .slice(1);
        if (context !== 'settings') {
            Logger.Log('OnRunSteamURL: Invalid context %o, expected "settings"', context);
            return;
        }
        if (!option) {
            Logger.Log('OnRunSteamURL: No option specified, navigating to settings');
            client.Navigation.Navigate('/Digitaldepot/settings/' + action);
            return;
        }
        if (action === 'devtools' && parameter === 'open') {
            // Open the DevTools window
            SteamClient.Browser.OpenDevTools();
        }
        if (action === 'plugins') {
            // God, why
            const plugins = JSON.parse(await FindAllPlugins()).map((e) => ({ ...e, plugin_name: e.data.name }));
            if (parameter) {
                if (!plugins.some((e) => e.data.name === parameter)) {
                    return;
                }
                const neededPlugin = plugins.find((e) => e.data.name === parameter);
                neededPlugin.enabled = option === 'enable';
            }
            else {
                // Disable them all
                for (const plugin of plugins) {
                    // ..except me, of course
                    plugin.enabled = plugin.data.name === 'core';
                }
            }
            UpdatePluginStatus({ pluginJson: JSON.stringify(plugins) });
            SteamClient.Browser.RestartJSContext();
        }
        if (action === 'themes') {
            const themes = JSON.parse(await FindAllThemes());
            const theme = themes.find((e) => e.native === parameter);
            const theme_name = !!theme && option === 'enable' ? theme.native : DEFAULT_THEME_NAME;
            ChangeTheme({ theme_name });
            SteamClient.Browser.RestartJSContext();
        }
    };

    /**
     * ==================================================
     *   _____ _ _ _             _
     *  |     |_| | |___ ___ ___|_|_ _ _____
     *  | | | | | | | -_|   |   | | | |     |
     *  |_|_|_|_|_|_|___|_|_|_|_|_|___|_|_|_|
     *
     * ==================================================
     *
     * Copyright (c) 2025 Project Digitaldepot
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in all
     * copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     * SOFTWARE.
     */
    __wrapped_callable__('Millennium.steam_path');
    const PyFindAllPlugins = __wrapped_callable__('find_all_plugins');
    const PyUpdatePluginStatus = __wrapped_callable__('ChangePluginStatus');
    const PyGetEnvironmentVar = __wrapped_callable__('GetEnvironmentVar');
    const PyInstallTheme = __wrapped_callable__('themeInstaller.install_theme');
    const PyUninstallTheme = __wrapped_callable__('themeInstaller.uninstall_theme');
    const PyIsThemeInstalled = __wrapped_callable__('themeInstaller.check_install');
    const PyGetThemeInfo = __wrapped_callable__('themeInstaller.get_theme_from_gitpair');
    const PyUninstallPlugin = __wrapped_callable__('pluginInstaller.uninstall_plugin');
    const PyUpdateTheme = __wrapped_callable__('updater.download_theme_update');
    const PyUpdatePlugin = __wrapped_callable__('updater.download_plugin_update');
    const PyResyncUpdates = __wrapped_callable__('updater.resync_updates');
    const PyInstallPlugin = __wrapped_callable__('pluginInstaller.install_plugin');
    const PyIsPluginInstalled = __wrapped_callable__('pluginInstaller.check_install');
    __wrapped_callable__('updater.set_update_notifs_status');
    __wrapped_callable__('MillenniumUpdater.set_user_wants_updates');
    __wrapped_callable__('MillenniumUpdater.set_user_wants_update_notify');
    __wrapped_callable__('theme_config.get_active_theme');
    const PyFindAllThemes = __wrapped_callable__('find_all_themes');
    const PyGetThemeColorOptions = __wrapped_callable__('theme_config.get_color_opts');
    __wrapped_callable__('theme_config.does_theme_use_accent_color');
    __wrapped_callable__('theme_config.set_config_keypair');
    const PySetBackendConfig = __wrapped_callable__('config.set_all');
    const PyGetBackendConfig = __wrapped_callable__('config.get_all');
    const PyGetStartupConfig = __wrapped_callable__('GetMillenniumConfig');
    const PyGetLogData = __wrapped_callable__('GetPluginBackendLogs');
    const PySetClipboardText = __wrapped_callable__('SetClipboardContent');
    const PyGetRootColors = __wrapped_callable__('theme_config.get_colors');
    const PyChangeCondition = __wrapped_callable__('theme_config.change_condition');
    const PyChangeColor = __wrapped_callable__('theme_config.change_color');
    const PyChangeAccentColor = __wrapped_callable__('theme_config.change_accent_color');
    const PyUpdateMillennium = __wrapped_callable__('MillenniumUpdater.queue_update');

    /**
     * ==================================================
     *   _____ _ _ _             _
     *  |     |_| | |___ ___ ___|_|_ _ _____
     *  | | | | | | | -_|   |   | | | |     |
     *  |_|_|_|_|_|_|___|_|_|_|_|_|___|_|_|_|
     *
     * ==================================================
     *
     * Copyright (c) 2025 Project Digitaldepot
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in all
     * copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     * SOFTWARE.
     */
    const CommonPatchTypes = ['TargetCss', 'TargetJs'];
    var ConditionalControlFlowType;
    (function (ConditionalControlFlowType) {
        ConditionalControlFlowType[ConditionalControlFlowType["TargetCss"] = 0] = "TargetCss";
        ConditionalControlFlowType[ConditionalControlFlowType["TargetJs"] = 1] = "TargetJs";
    })(ConditionalControlFlowType || (ConditionalControlFlowType = {}));
    var UpdaterOptionProps;
    (function (UpdaterOptionProps) {
        UpdaterOptionProps[UpdaterOptionProps["UNSET"] = 0] = "UNSET";
        UpdaterOptionProps[UpdaterOptionProps["YES"] = 1] = "YES";
        UpdaterOptionProps[UpdaterOptionProps["NO"] = 2] = "NO";
    })(UpdaterOptionProps || (UpdaterOptionProps = {}));
    var OSType;
    (function (OSType) {
        OSType[OSType["Windows"] = 0] = "Windows";
        OSType[OSType["Linux"] = 1] = "Linux";
        OSType[OSType["Darwin"] = 2] = "Darwin";
    })(OSType || (OSType = {}));
    var OnMillenniumUpdate;
    (function (OnMillenniumUpdate) {
        OnMillenniumUpdate[OnMillenniumUpdate["DO_NOTHING"] = 0] = "DO_NOTHING";
        OnMillenniumUpdate[OnMillenniumUpdate["NOTIFY"] = 1] = "NOTIFY";
        OnMillenniumUpdate[OnMillenniumUpdate["AUTO_INSTALL"] = 2] = "AUTO_INSTALL";
    })(OnMillenniumUpdate || (OnMillenniumUpdate = {}));

    /**
     * ==================================================
     *   _____ _ _ _             _
     *  |     |_| | |___ ___ ___|_|_ _ _____
     *  | | | | | | | -_|   |   | | | |     |
     *  |_|_|_|_|_|_|___|_|_|_|_|_|___|_|_|_|
     *
     * ==================================================
     *
     * Copyright (c) 2025 Project Digitaldepot
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in all
     * copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     * SOFTWARE.
     */
    class SettingsManager {
        constructor() {
            this.updateFn = null;
            this.pendingUpdates = [];
            PyGetBackendConfig().then((cfg) => {
                this.settings = JSON.parse(cfg);
            });
        }
        getConfig() {
            return this.settings;
        }
        get config() {
            return this.settings;
        }
        setInitialConfig(config) {
            this.settings = config;
        }
        setUpdateFunction(updateFn) {
            this.updateFn = updateFn;
            this.pendingUpdates.forEach((recipe) => this.updateFn(recipe));
            this.pendingUpdates = [];
        }
        updateConfig(recipe) {
            if (this.updateFn) {
                this.updateFn((draft) => {
                    recipe(draft);
                    this.settings = draft; // Update internal reference
                });
            }
            else {
                this.pendingUpdates.push(recipe);
            }
        }
        setConfigDirect(newConfig) {
            this.settings = newConfig;
        }
        /**
         * Force save the config to the backend.
         * This is useful when the config is changed, but no config provider is available.
         * In the case no provider is available, the config will not be saved; so this function is used to force the config to be saved.
         */
        forceSaveConfig() {
            PySetBackendConfig({ config: JSON.stringify(this.settings), skip_propagation: true });
        }
    }
    const settingsManager = new SettingsManager();

    const DOMModifier = {
        /**
         * Append a StyleSheet to DOM from raw text
         * @param document Target document to append StyleSheet to
         * @param innerStyle string encoded CSS
         * @param id HTMLElement id
         */
        AddStyleSheetFromText: (document, innerStyle, id) => {
            if (document.querySelectorAll(`style[id='${id}']`).length)
                return;
            document.head.appendChild(Object.assign(document.createElement('style'), { id: id })).innerText = innerStyle;
        },
        /**
         * Append a StyleSheet to DOM from loopbackhost or absolute URI
         * @param document Target document to append StyleSheet to
         * @param localPath relative/absolute path to CSS module
         */
        AddStyleSheet: (document, localPath) => {
            if (!settingsManager.config.general.injectCSS)
                return;
            if (document.querySelectorAll(`link[href='${localPath}']`).length)
                return;
            document.head.appendChild(Object.assign(document.createElement('link'), {
                href: localPath,
                rel: 'stylesheet',
                id: 'millennium-injected',
            }));
        },
        /**
         * Append a JavaScript module to DOM from loopbackhost or absolute URI
         * @param document Target document to append JavaScript to
         * @param localPath relative/absolute path to CSS module
         */
        AddJavaScript: (document, localPath) => {
            if (!settingsManager.config.general.injectJavascript)
                return;
            if (document.querySelectorAll(`script[src='${localPath}'][type='module']`).length)
                return;
            document.head.appendChild(Object.assign(document.createElement('script'), {
                src: localPath,
                type: 'module',
                id: 'millennium-injected',
            }));
        },
    };
    function constructThemePath(nativeName, relativePath) {
        return [window.location.origin, 'skins', nativeName, relativePath].join('/');
    }
    const classListMatch = (classList, affectee) => {
        for (const classItem in classList) {
            if (classList[classItem].includes(affectee)) {
                return true;
            }
        }
        return false;
    };
    const EvaluatePatch = (type, modulePatch, documentTitle, classList, document) => {
        if (modulePatch?.[CommonPatchTypes?.[type]] === undefined) {
            return;
        }
        modulePatch[CommonPatchTypes[type]].affects.forEach((affectee) => {
            if (!documentTitle.match(affectee) && !classListMatch(classList, affectee)) {
                return;
            }
            switch (type) {
                case ConditionalControlFlowType.TargetCss: {
                    DOMModifier.AddStyleSheet(document, constructThemePath(window.PLUGIN_LIST[pluginName].activeTheme.native, modulePatch[CommonPatchTypes[type]].src));
                    break;
                }
                case ConditionalControlFlowType.TargetJs: {
                    DOMModifier.AddJavaScript(document, constructThemePath(window.PLUGIN_LIST[pluginName].activeTheme.native, modulePatch[CommonPatchTypes[type]].src));
                    break;
                }
            }
        });
    };

    function EvaluateConditions(theme, title, classes, document) {
        const themeConditions = theme.data.Conditions;
        const savedConditions = window.PLUGIN_LIST[pluginName].conditionals[theme.native];
        for (const condition in themeConditions) {
            if (!themeConditions.hasOwnProperty(condition)) {
                return;
            }
            if (condition in savedConditions) {
                const patch = themeConditions[condition].values[savedConditions[condition]];
                EvaluatePatch(ConditionalControlFlowType.TargetCss, patch, title, classes, document);
                EvaluatePatch(ConditionalControlFlowType.TargetJs, patch, title, classes, document);
            }
        }
    }

    /**
     * @deprecated this entire module is deprecated and is only here to support Digitaldepot <= 1.1.5
     *
     * @note this module does not provide interfaces to edit the deprecated conditions,
     * it serves only to allow old ones to still work until they are properly updated by the developer.
     */
    var ConfigurationItemType;
    (function (ConfigurationItemType) {
        ConfigurationItemType["ComboBox"] = "ComboBox";
        ConfigurationItemType["CheckBox"] = "CheckBox";
    })(ConfigurationItemType || (ConfigurationItemType = {}));
    const GetFromConfigurationStore = (configName) => {
        const activeTheme = window.PLUGIN_LIST[pluginName].activeTheme.data;
        for (const configItem of activeTheme.Configuration) {
            if (configItem.Name === configName) {
                return configItem;
            }
        }
        return undefined;
    };
    const InsertModule = (target, document) => {
        const activeTheme = window.PLUGIN_LIST[pluginName].activeTheme;
        target?.TargetCss && DOMModifier.AddStyleSheet(document, constructThemePath(activeTheme.native, target.TargetCss));
        target?.TargetJs && DOMModifier.AddJavaScript(document, constructThemePath(activeTheme.native, target.TargetJs));
    };
    const EvaluateComboBox = (statement, currentValue, document) => {
        statement.Combo.forEach((comboItem) => {
            if (comboItem.Equals === currentValue) {
                InsertModule(comboItem?.True, document);
            }
            else {
                InsertModule(comboItem?.False, document);
            }
        });
    };
    const EvaluateCheckBox = (statement, currentValue, document) => {
        if (statement.Equals === currentValue) {
            InsertModule(statement?.True, document);
        }
        else {
            InsertModule(statement?.False, document);
        }
    };
    const EvaluateType = (statement) => {
        return statement.Combo !== undefined ? ConfigurationItemType.ComboBox : ConfigurationItemType.CheckBox;
    };
    const EvaluateStatement = (statement, document) => {
        const statementId = statement.If;
        const statementStore = GetFromConfigurationStore(statementId);
        const storedStatementValue = statementStore.Value;
        const statementType = EvaluateType(statement);
        switch (statementType) {
            case ConfigurationItemType.CheckBox: {
                EvaluateCheckBox(statement, storedStatementValue, document);
                break;
            }
            case ConfigurationItemType.ComboBox: {
                EvaluateComboBox(statement, storedStatementValue, document);
                break;
            }
        }
    };
    const EvaluateStatements = (patchItem, document) => {
        if (Array.isArray(patchItem.Statement)) {
            patchItem.Statement.forEach((statement) => {
                EvaluateStatement(statement, document);
            });
        }
        else {
            EvaluateStatement(patchItem.Statement, document);
        }
    };

    var settingsPanelPlugins$c = "Plugins";
    var settingsPanelThemes$c = "Themes";
    var settingsPanelGeneral$c = "General";
    var settingsPanelUpdates$c = "Updates";
    var settingsPanelLogs$c = "Logs";
    var settingsPanelSettings$c = "Settings";
    var settingsPanelAbout$c = "About";
    var settingsPanelBugReport$c = "Report a Bug";
    var itemNoDescription$c = "No description yet.";
    var themePanelClientTheme$c = "Client Theme";
    var themePanelThemeTooltip$c = "Select the theme you want Steam to use (requires reload)";
    var pluginPanelPluginTooltip$c = "Don't have any plugins installed? ";
    var themePanelGetMoreThemes$c = "Get more themes";
    var pluginPanelGetMorePlugins$c = "Find plugins here";
    var themePanelInjectJavascript$c = "Allow JavaScript insertions";
    var themePanelInjectJavascriptToolTip$c = "Decide whether themes are allowed to insert JavaScript into Steam. Disabling JavaScript may break Steam interface as a byproduct (requires reload)";
    var themePanelInjectCSS$c = "Allow StyleSheet insertions";
    var themePanelInjectCSSToolTip$c = "Decide whether themes are allowed to insert stylesheets into Steam. (requires reload)";
    var themePanelCustomAccentColor$c = "Override Accent Color";
    var themePanelCustomAccentColorToolTip$c = "Override your system accent color within Steam. This has no effect unless a theme using your system accent color.";
    var themePanelCustomColorNotUsed$c = "Note: The active theme does NOT use this setting.";
    var themePanelCustomColorUsed$c = "Note: The active theme uses this setting!";
    var updatePanelHasUpdates$c = "Updates Available!";
    var updatePanelHasUpdatesSub$c = "Digitaldepot found the following updates for you!";
    var updatePanelReleasedTag$c = "Released:";
    var updatePanelReleasePatchNotes$c = "Patch Notes:";
    var updatePanelIsUpdating$c = "Updating...";
    var updatePanelUpdate$c = "Update";
    var updatePanelNoUpdatesFoundHeader$c = "No updates";
    var updatePanelNoUpdatesFound$c = "No updates available. Everything's up to date!";
    var ViewMore$c = "View More";
    var aboutThemeAnonymous$c = "Anonymous";
    var aboutThemeTitle$c = "About";
    var aboutThemeVerifiedDev$c = "Verified Developer";
    var viewSourceCode$c = "View Source Code";
    var showInFolder$c = "Show in Folder";
    var uninstall$c = "Uninstall";
    var optionSaveChanges$c = "Save Changes";
    var optionReloadNow$c = "Reload Now";
    var optionReloadLater$c = "Reload Later";
    var optionReloadRequired$c = "Reload Required";
    var optionPluginNeedsReload$c = "To enable or disable the selected plugins, a reload is required. Are you sure you want to continue?";
    var updatePanelUpdateNotifications$c = "Show Notification Toasts";
    var updatePanelUpdateNotificationsTooltip$c = "Get Digitaldepot to give you a reminder when an item in your library has an update!";
    var customThemeSettingsColors$c = "Colors";
    var customThemeSettingsConfig$c = "Custom Settings";
    var errorMessageTitle$c = "Whoops!";
    var errorSubmitIssueNotValid$c = "Your issue is not valid. Make sure your issue does not involve a plugin or theme, if it does, please contact the developer of the plugin or theme.";
    var errorSubmitIssueNoDescription$c = "Please provide a description of your issue (10 characters or more).";
    var errorSubmitIssueNoSteps$c = "Please provide an overview on how to reproduce your issue (10 characters or more).";
    var errorSubmitIssueTooFrequent$c = "Woah there! You're submitting issues too quickly. Please wait a bit before submitting another issue.";
    var updateSuccessful$c = "Successfully updated {0}";
    var updateSuccessfulRestart$c = "Successfully updated {0}! As you currently have it active, you will need to restart Steam for the changes to take effect.";
    var updateFailed$c = "Failed to update {0}! Check the logs for more information.";
    var messageTitleWarning$c = "One Sec!";
    var messageUpdateDisableClarification$c = "Do you want to disable update checks entirely, or just disable the update these notifications? You can always change this in Digitaldepot Settings later.";
    var DisableUpdates$c = "Disable Updates";
    var DisableOnlyNotifications$c = "Just Notifications";
    var message1162025SecurityUpdate$c = "We're deciding to update our security protocols to better benefit you, and the community as a whole. As of 3/27/2025, we've decided to implement measures to explicitly ask you if you want to receive updates from Digitaldepot.";
    var message1162025SecurityUpdateTooltip$c = "This is solely Digitaldepot updates, not theme and plugin updates, which are handled separately and were never automatic";
    var toggleWantsMillenniumUpdates$c = "Do you want Digitaldepot to check for updates?";
    var toggleWantsMillenniumUpdatesTooltip$c = "If enabled, Digitaldepot will automatically check for updates. Updates will NOT automatically be applied unless you've disabled notifications (the setting below). You will receive a popup box with the option to update or dismiss.";
    var toggleWantsMillenniumUpdatesNotifications$c = "Do you want to be notified when updates are found? (similar to this popup)";
    var toggleWantsMillenniumUpdatesNotificationsTooltip$c = "If check for updates is on, an update is found, and this setting is on, you will receive a popup box with the option to update, or stay on the version you're already on. If check for updates is on, an update is found, and you do NOT have this setting enabled, you will not receive a popup box and the update will be applied automatically.";
    var updateSecurityWarning$c = "It's highly recommended to keep these settings enabled, as it ensures you're always up-to-date with the latest security fixes. Failure to keep Digitaldepot updated may result in security vulnerabilities, broken features, or other issues.";
    var settingsAreChangeableLater$c = "You can change these settings later in Digitaldepot Settings.";
    var strViewUpdateDiffInBrowser$c = "View Diff in Browser";
    var strViewDownloadInfo$c = "View Download Information";
    var strUpdateNextStartup$c = "Update Next Startup";
    var strUpdateReject$c = "I'll pass";
    var strDontShowAgain$c = "Don't show this again";
    var strAnUpdateIsAvailable$c = "An update is available for Digitaldepot! We're showing you this message because you've opted in to receive updates. If you no longer want to receive these messages, you can turn on automatic updates, or you can disable updates entirely from Digitaldepot Settings.";
    var updatePanelCheckForUpdates$c = "Check for Updates";
    var updatePanelShowUpdateNotifications$c = "Show Update Notifications";
    var HoldOn$c = "Hold on!";
    var updateFailedPluginRunning$c = "Digitaldepot can't update \"{0}\" while it's running, you'll need to disable it first.";
    var themeAndPluginUpdateNotification$c = "Digitaldepot found {0} available {1}";
    var updateSingular$c = "update";
    var updatePlural$c = "updates";
    var updatePanelErrorHeader$c = "An error occurred while checking for updates!";
    var updatePanelErrorBody$c = "Please check your internet connection and try again. ";
    var updatePanelErrorButton$c = "Retry";
    var errorFailedConnection$c = "Failed to connect to Digitaldepot!";
    var errorFailedConnectionBody$c = "This issue isn't network related, you're most likely missing a file digitaldepot needs, or are experiencing an unexpected bug.";
    var errorFailedConnectionButton$c = "Open Logs Folder";
    var strDone$c = "Done";
    var strUnknown$c = "Unknown";
    var strInstallPlugin$c = "Install {0}";
    var strSuccessfulInstall$c = "Successfully installed {0}!";
    var strInstallComplete$c = "Install Complete";
    var strInstallProgress$c = "Installation Progress";
    var strEnablePlugin$c = "Enable Plugin (Requires Reload)";
    var strUseThemeRequiresReload$c = "Use Theme (Restart Reload)";
    var strInvalidPluginBuildMessage$c = "This plugin does not have a valid build for your OS.";
    var strInvalidPluginBuild$c = "Invalid Build";
    var strAlreadyInPluginLibrary$c = "{0} is already in your plugin library!";
    var strAlreadyInstalled$c = "Already Installed";
    var errorFailedToDownloadPlugin$c = "Failed to download plugin: {0}";
    var errorFailedToStartThemeInstaller$c = "Failed to start internal installer module...";
    var warningConflictingFiles$c = "Conflicting Files";
    var warningThemeAlreadyInstalled$c = "You already have this theme installed! Would you like to reinstall it? If you've added any custom files their data will be lost.";
    var errorFailedToUninstallTheme$c = "Failed to uninstall theme: {0}";
    var strNeverMind$c = "Never Mind";
    var strReinstall$c = "Reinstall";
    var errorFailedToFetchTheme$c = "Failed to fetch theme info: ";
    var errorFailedToFetchPlugin$c = "Failed to fetch plugin info: ";
    var errorInvalidID$c = "ID is empty or invalid";
    var warnProceedInstallation$c = "Are you sure you want to proceed with the installation?";
    var strMillenniumUpdate$c = "Digitaldepot Updates";
    var strByAuthor$c = "By {0}";
    var strUpdatingTheme$c = "Updating theme...";
    var strFinishedUpdating$c = "Finished updating!";
    var strPreparing$c = "Preparing...";
    var strUpdatingPlugin$c = "Updating plugin...";
    var strComplete$c = "Complete!";
    var eOnMillenniumUpdateDoNothing$c = "Do nothing";
    var eOnMillenniumUpdateNotify$c = "Notify me";
    var eOnMillenniumUpdateAutoInstall$c = "Automatically install";
    var optionCheckForMillenniumUpdates$c = "Check for Digitaldepot updates";
    var optionCheckForThemeAndPluginUpdates$c = "Check for theme & plugin updates";
    var optionWhenAnUpdateForMillenniumIsAvailable$c = "When an update for Digitaldepot is available";
    var optionWhenAPluginOrThemeUpdateIsAvailable$c = "When a plugin or theme update is available";
    var headerOnStartup$c = "On Startup";
    var headerUpdates$c = "Updates";
    var headerNotifications$c = "Notifications";
    var headerThemes$c = "Themes";
    var optionInstallPlugin$c = "Install a plugin";
    var optionInstallTheme$c = "Install a theme";
    var optionBrowseLocalFiles$c = "Browse local files";
    var tooltipCheckForMillenniumUpdates$c = "Checking for updates is disabled, this setting will not take effect.";
    var strWelcomeModalTitle$c = "Welcome to Digitaldepot 👋";
    var strWelcomeModalDescription$c = "Your Steam is now integrated with DigitalDepot!\n\nSince this is your first time running the DigitalDepot application, let's start your journey with us right now!\n\nIf you need help, you can live chat directly at [Digitaldepot](https://digitaldepot.id/) 💬\n\nEnjoy your new experience with DigitalDepot 🚀";
    var strWelcomeModalOKButton$c = "Got it!";
    var strAbout$c = "About";
    var strAboutVersion$c = "Digitaldepot version";
    var strAboutBuildDate$c = "Digitaldepot build date";
    var millenniumUpdateSuccessTitle$c = "Successfully updated!";
    var millenniumUpdateSuccessMessage$c = "Successfully updated Digitaldepot to {0}. Changes will take effect after a restart.";
    var english = {
    	settingsPanelPlugins: settingsPanelPlugins$c,
    	settingsPanelThemes: settingsPanelThemes$c,
    	settingsPanelGeneral: settingsPanelGeneral$c,
    	settingsPanelUpdates: settingsPanelUpdates$c,
    	settingsPanelLogs: settingsPanelLogs$c,
    	settingsPanelSettings: settingsPanelSettings$c,
    	settingsPanelAbout: settingsPanelAbout$c,
    	settingsPanelBugReport: settingsPanelBugReport$c,
    	itemNoDescription: itemNoDescription$c,
    	themePanelClientTheme: themePanelClientTheme$c,
    	themePanelThemeTooltip: themePanelThemeTooltip$c,
    	pluginPanelPluginTooltip: pluginPanelPluginTooltip$c,
    	themePanelGetMoreThemes: themePanelGetMoreThemes$c,
    	pluginPanelGetMorePlugins: pluginPanelGetMorePlugins$c,
    	themePanelInjectJavascript: themePanelInjectJavascript$c,
    	themePanelInjectJavascriptToolTip: themePanelInjectJavascriptToolTip$c,
    	themePanelInjectCSS: themePanelInjectCSS$c,
    	themePanelInjectCSSToolTip: themePanelInjectCSSToolTip$c,
    	themePanelCustomAccentColor: themePanelCustomAccentColor$c,
    	themePanelCustomAccentColorToolTip: themePanelCustomAccentColorToolTip$c,
    	themePanelCustomColorNotUsed: themePanelCustomColorNotUsed$c,
    	themePanelCustomColorUsed: themePanelCustomColorUsed$c,
    	updatePanelHasUpdates: updatePanelHasUpdates$c,
    	updatePanelHasUpdatesSub: updatePanelHasUpdatesSub$c,
    	updatePanelReleasedTag: updatePanelReleasedTag$c,
    	updatePanelReleasePatchNotes: updatePanelReleasePatchNotes$c,
    	updatePanelIsUpdating: updatePanelIsUpdating$c,
    	updatePanelUpdate: updatePanelUpdate$c,
    	updatePanelNoUpdatesFoundHeader: updatePanelNoUpdatesFoundHeader$c,
    	updatePanelNoUpdatesFound: updatePanelNoUpdatesFound$c,
    	ViewMore: ViewMore$c,
    	aboutThemeAnonymous: aboutThemeAnonymous$c,
    	aboutThemeTitle: aboutThemeTitle$c,
    	aboutThemeVerifiedDev: aboutThemeVerifiedDev$c,
    	viewSourceCode: viewSourceCode$c,
    	showInFolder: showInFolder$c,
    	uninstall: uninstall$c,
    	optionSaveChanges: optionSaveChanges$c,
    	optionReloadNow: optionReloadNow$c,
    	optionReloadLater: optionReloadLater$c,
    	optionReloadRequired: optionReloadRequired$c,
    	optionPluginNeedsReload: optionPluginNeedsReload$c,
    	updatePanelUpdateNotifications: updatePanelUpdateNotifications$c,
    	updatePanelUpdateNotificationsTooltip: updatePanelUpdateNotificationsTooltip$c,
    	customThemeSettingsColors: customThemeSettingsColors$c,
    	customThemeSettingsConfig: customThemeSettingsConfig$c,
    	errorMessageTitle: errorMessageTitle$c,
    	errorSubmitIssueNotValid: errorSubmitIssueNotValid$c,
    	errorSubmitIssueNoDescription: errorSubmitIssueNoDescription$c,
    	errorSubmitIssueNoSteps: errorSubmitIssueNoSteps$c,
    	errorSubmitIssueTooFrequent: errorSubmitIssueTooFrequent$c,
    	updateSuccessful: updateSuccessful$c,
    	updateSuccessfulRestart: updateSuccessfulRestart$c,
    	updateFailed: updateFailed$c,
    	messageTitleWarning: messageTitleWarning$c,
    	messageUpdateDisableClarification: messageUpdateDisableClarification$c,
    	DisableUpdates: DisableUpdates$c,
    	DisableOnlyNotifications: DisableOnlyNotifications$c,
    	message1162025SecurityUpdate: message1162025SecurityUpdate$c,
    	message1162025SecurityUpdateTooltip: message1162025SecurityUpdateTooltip$c,
    	toggleWantsMillenniumUpdates: toggleWantsMillenniumUpdates$c,
    	toggleWantsMillenniumUpdatesTooltip: toggleWantsMillenniumUpdatesTooltip$c,
    	toggleWantsMillenniumUpdatesNotifications: toggleWantsMillenniumUpdatesNotifications$c,
    	toggleWantsMillenniumUpdatesNotificationsTooltip: toggleWantsMillenniumUpdatesNotificationsTooltip$c,
    	updateSecurityWarning: updateSecurityWarning$c,
    	settingsAreChangeableLater: settingsAreChangeableLater$c,
    	strViewUpdateDiffInBrowser: strViewUpdateDiffInBrowser$c,
    	strViewDownloadInfo: strViewDownloadInfo$c,
    	strUpdateNextStartup: strUpdateNextStartup$c,
    	strUpdateReject: strUpdateReject$c,
    	strDontShowAgain: strDontShowAgain$c,
    	strAnUpdateIsAvailable: strAnUpdateIsAvailable$c,
    	updatePanelCheckForUpdates: updatePanelCheckForUpdates$c,
    	updatePanelShowUpdateNotifications: updatePanelShowUpdateNotifications$c,
    	HoldOn: HoldOn$c,
    	updateFailedPluginRunning: updateFailedPluginRunning$c,
    	themeAndPluginUpdateNotification: themeAndPluginUpdateNotification$c,
    	updateSingular: updateSingular$c,
    	updatePlural: updatePlural$c,
    	updatePanelErrorHeader: updatePanelErrorHeader$c,
    	updatePanelErrorBody: updatePanelErrorBody$c,
    	updatePanelErrorButton: updatePanelErrorButton$c,
    	errorFailedConnection: errorFailedConnection$c,
    	errorFailedConnectionBody: errorFailedConnectionBody$c,
    	errorFailedConnectionButton: errorFailedConnectionButton$c,
    	strDone: strDone$c,
    	strUnknown: strUnknown$c,
    	strInstallPlugin: strInstallPlugin$c,
    	strSuccessfulInstall: strSuccessfulInstall$c,
    	strInstallComplete: strInstallComplete$c,
    	strInstallProgress: strInstallProgress$c,
    	strEnablePlugin: strEnablePlugin$c,
    	strUseThemeRequiresReload: strUseThemeRequiresReload$c,
    	strInvalidPluginBuildMessage: strInvalidPluginBuildMessage$c,
    	strInvalidPluginBuild: strInvalidPluginBuild$c,
    	strAlreadyInPluginLibrary: strAlreadyInPluginLibrary$c,
    	strAlreadyInstalled: strAlreadyInstalled$c,
    	errorFailedToDownloadPlugin: errorFailedToDownloadPlugin$c,
    	errorFailedToStartThemeInstaller: errorFailedToStartThemeInstaller$c,
    	warningConflictingFiles: warningConflictingFiles$c,
    	warningThemeAlreadyInstalled: warningThemeAlreadyInstalled$c,
    	errorFailedToUninstallTheme: errorFailedToUninstallTheme$c,
    	strNeverMind: strNeverMind$c,
    	strReinstall: strReinstall$c,
    	errorFailedToFetchTheme: errorFailedToFetchTheme$c,
    	errorFailedToFetchPlugin: errorFailedToFetchPlugin$c,
    	errorInvalidID: errorInvalidID$c,
    	warnProceedInstallation: warnProceedInstallation$c,
    	strMillenniumUpdate: strMillenniumUpdate$c,
    	strByAuthor: strByAuthor$c,
    	strUpdatingTheme: strUpdatingTheme$c,
    	strFinishedUpdating: strFinishedUpdating$c,
    	strPreparing: strPreparing$c,
    	strUpdatingPlugin: strUpdatingPlugin$c,
    	strComplete: strComplete$c,
    	eOnMillenniumUpdateDoNothing: eOnMillenniumUpdateDoNothing$c,
    	eOnMillenniumUpdateNotify: eOnMillenniumUpdateNotify$c,
    	eOnMillenniumUpdateAutoInstall: eOnMillenniumUpdateAutoInstall$c,
    	optionCheckForMillenniumUpdates: optionCheckForMillenniumUpdates$c,
    	optionCheckForThemeAndPluginUpdates: optionCheckForThemeAndPluginUpdates$c,
    	optionWhenAnUpdateForMillenniumIsAvailable: optionWhenAnUpdateForMillenniumIsAvailable$c,
    	optionWhenAPluginOrThemeUpdateIsAvailable: optionWhenAPluginOrThemeUpdateIsAvailable$c,
    	headerOnStartup: headerOnStartup$c,
    	headerUpdates: headerUpdates$c,
    	headerNotifications: headerNotifications$c,
    	headerThemes: headerThemes$c,
    	optionInstallPlugin: optionInstallPlugin$c,
    	optionInstallTheme: optionInstallTheme$c,
    	optionBrowseLocalFiles: optionBrowseLocalFiles$c,
    	tooltipCheckForMillenniumUpdates: tooltipCheckForMillenniumUpdates$c,
    	strWelcomeModalTitle: strWelcomeModalTitle$c,
    	strWelcomeModalDescription: strWelcomeModalDescription$c,
    	strWelcomeModalOKButton: strWelcomeModalOKButton$c,
    	strAbout: strAbout$c,
    	strAboutVersion: strAboutVersion$c,
    	strAboutBuildDate: strAboutBuildDate$c,
    	millenniumUpdateSuccessTitle: millenniumUpdateSuccessTitle$c,
    	millenniumUpdateSuccessMessage: millenniumUpdateSuccessMessage$c
    };

    var settingsPanelPlugins$b = "Wtyczki";
    var settingsPanelThemes$b = "Motywy";
    var settingsPanelGeneral$b = "Ogólne";
    var settingsPanelUpdates$b = "Aktualizacje";
    var settingsPanelLogs$b = "Logi";
    var settingsPanelSettings$b = "Ustawienia";
    var settingsPanelAbout$b = "O programie";
    var settingsPanelBugReport$b = "Zgłoś błąd";
    var itemNoDescription$b = "Brak opisu.";
    var themePanelClientTheme$b = "Motyw klienta";
    var themePanelThemeTooltip$b = "Wybierz motyw, którego ma używać Steam (wymaga ponownego uruchomienia)";
    var pluginPanelPluginTooltip$b = "Nie masz żadnych zainstalowanych wtyczek?";
    var themePanelGetMoreThemes$b = "Pobierz więcej motywów";
    var pluginPanelGetMorePlugins$b = "Znajdź wtyczki tutaj";
    var themePanelInjectJavascript$b = "Zezwól na wstawianie JavaScript";
    var themePanelInjectJavascriptToolTip$b = "Określ, czy motywy mogą wstawiać JavaScript do Steama. Wyłączenie może spowodować błędy w interfejsie Steama (wymaga ponownego uruchomienia)";
    var themePanelInjectCSS$b = "Zezwól na wstawianie arkuszy stylów";
    var themePanelInjectCSSToolTip$b = "Określ, czy motywy mogą wstawiać arkusze stylów do Steama. (wymaga ponownego uruchomienia)";
    var themePanelCustomAccentColor$b = "Zastąp kolor akcentu";
    var themePanelCustomAccentColorToolTip$b = "Zastąp systemowy kolor akcentu w Steam. Nie działa, jeśli motyw nie używa koloru akcentu.";
    var themePanelCustomColorNotUsed$b = "Uwaga: aktywny motyw NIE używa tego ustawienia.";
    var themePanelCustomColorUsed$b = "Uwaga: aktywny motyw używa tego ustawienia!";
    var updatePanelHasUpdates$b = "Dostępne aktualizacje!";
    var updatePanelHasUpdatesSub$b = "Digitaldepot znalazł dla Ciebie następujące aktualizacje!";
    var updatePanelReleasedTag$b = "Wydano:";
    var updatePanelReleasePatchNotes$b = "Lista zmian:";
    var updatePanelIsUpdating$b = "Aktualizowanie...";
    var updatePanelUpdate$b = "Aktualizuj";
    var updatePanelNoUpdatesFoundHeader$b = "Brak aktualizacji";
    var updatePanelNoUpdatesFound$b = "Brak dostępnych aktualizacji. Wszystko jest aktualne!";
    var ViewMore$b = "Zobacz więcej";
    var aboutThemeAnonymous$b = "Anonimowy";
    var aboutThemeTitle$b = "O motywie";
    var aboutThemeVerifiedDev$b = "Zweryfikowany deweloper";
    var viewSourceCode$b = "Zobacz kod źródłowy";
    var showInFolder$b = "Pokaż w folderze";
    var uninstall$b = "Odinstaluj";
    var optionSaveChanges$b = "Zapisz zmiany";
    var optionReloadNow$b = "Przeładuj teraz";
    var optionReloadLater$b = "Przeładuj później";
    var optionReloadRequired$b = "Wymagane przeładowanie";
    var optionPluginNeedsReload$b = "Aby włączyć lub wyłączyć wybrane wtyczki, wymagane jest przeładowanie. Czy na pewno chcesz kontynuować?";
    var updatePanelUpdateNotifications$b = "Pokazuj powiadomienia";
    var updatePanelUpdateNotificationsTooltip$b = "Otrzymuj przypomnienia, gdy element w Twojej bibliotece ma aktualizację!";
    var customThemeSettingsColors$b = "Kolory";
    var customThemeSettingsConfig$b = "Ustawienia niestandardowe";
    var errorMessageTitle$b = "Ups!";
    var errorSubmitIssueNotValid$b = "Zgłoszenie jest nieprawidłowe. Upewnij się, że nie dotyczy ono wtyczki ani motywu — w takim przypadku skontaktuj się z ich autorem.";
    var errorSubmitIssueNoDescription$b = "Podaj opis problemu (co najmniej 10 znaków).";
    var errorSubmitIssueNoSteps$b = "Podaj kroki, jak odtworzyć problem (co najmniej 10 znaków).";
    var errorSubmitIssueTooFrequent$b = "Hej! Zbyt szybko wysyłasz zgłoszenia. Poczekaj chwilę przed kolejnym.";
    var updateSuccessful$b = "Pomyślnie zaktualizowano {0}";
    var updateSuccessfulRestart$b = "Pomyślnie zaktualizowano {0}! Ponieważ jest aktualnie aktywny, musisz ponownie uruchomić Steam, aby zmiany zaczęły obowiązywać.";
    var updateFailed$b = "Nie udało się zaktualizować {0}! Sprawdź logi, aby uzyskać więcej informacji.";
    var messageTitleWarning$b = "Chwileczkę!";
    var messageUpdateDisableClarification$b = "Czy chcesz całkowicie wyłączyć sprawdzanie aktualizacji, czy tylko powiadomienia? Możesz to zmienić później w ustawieniach Digitaldepot.";
    var DisableUpdates$b = "Wyłącz aktualizacje";
    var DisableOnlyNotifications$b = "Tylko powiadomienia";
    var message1162025SecurityUpdate$b = "Aktualizujemy nasze protokoły bezpieczeństwa, aby lepiej Ci służyć. Od 27.03.2025 wprowadzamy mechanizm pytania, czy chcesz otrzymywać aktualizacje Digitaldepot.";
    var message1162025SecurityUpdateTooltip$b = "Dotyczy tylko aktualizacji Digitaldepot, nie motywów i wtyczek — te były zawsze ręczne.";
    var updateSecurityWarning$b = "Zaleca się pozostawienie tych ustawień włączonych, aby mieć najnowsze poprawki bezpieczeństwa. Wyłączenie może powodować luki, błędy i inne problemy.";
    var settingsAreChangeableLater$b = "Możesz to zmienić później w ustawieniach Digitaldepot.";
    var strViewUpdateDiffInBrowser$b = "Zobacz różnice w przeglądarce";
    var strViewDownloadInfo$b = "Zobacz informacje o pobraniu";
    var strUpdateNextStartup$b = "Aktualizuj przy następnym uruchomieniu";
    var strUpdateReject$b = "Pomiń";
    var strDontShowAgain$b = "Nie pokazuj ponownie";
    var strAnUpdateIsAvailable$b = "Dostępna jest aktualizacja Digitaldepot! Widzisz to, bo wybrałeś opcję powiadomień. Możesz włączyć automatyczne aktualizacje albo całkiem je wyłączyć w ustawieniach.";
    var updatePanelCheckForUpdates$b = "Sprawdź aktualizacje";
    var updatePanelShowUpdateNotifications$b = "Pokazuj powiadomienia o aktualizacjach";
    var HoldOn$b = "Poczekaj!";
    var updateFailedPluginRunning$b = "Digitaldepot nie może zaktualizować „{0}”, dopóki jest uruchomiony. Najpierw go wyłącz.";
    var themeAndPluginUpdateNotification$b = "Digitaldepot znalazł {0} dostępnych {1}";
    var updateSingular$b = "aktualizacja";
    var updatePlural$b = "aktualizacje";
    var updatePanelErrorHeader$b = "Wystąpił błąd podczas sprawdzania aktualizacji!";
    var updatePanelErrorBody$b = "Sprawdź swoje połączenie z internetem i spróbuj ponownie.";
    var updatePanelErrorButton$b = "Ponów próbę";
    var errorFailedConnection$b = "Nie udało się połączyć z Digitaldepot!";
    var errorFailedConnectionBody$b = "To nie problem z siecią — najpewniej brakuje pliku Digitaldepot lub wystąpił nieoczekiwany błąd.";
    var errorFailedConnectionButton$b = "Otwórz folder logów";
    var strDone$b = "Gotowe";
    var strUnknown$b = "Nieznane";
    var strInstallPlugin$b = "Zainstaluj {0}";
    var strSuccessfulInstall$b = "Pomyślnie zainstalowano {0}!";
    var strInstallComplete$b = "Instalacja zakończona";
    var strInstallProgress$b = "Postęp instalacji";
    var strEnablePlugin$b = "Włącz wtyczkę (wymaga przeładowania)";
    var strUseThemeRequiresReload$b = "Użyj motywu (wymaga ponownego uruchomienia)";
    var strInvalidPluginBuildMessage$b = "Ta wtyczka nie ma prawidłowej wersji dla Twojego systemu.";
    var strInvalidPluginBuild$b = "Nieprawidłowa wersja";
    var strAlreadyInPluginLibrary$b = "{0} jest już w Twojej bibliotece wtyczek!";
    var strAlreadyInstalled$b = "Już zainstalowano";
    var errorFailedToDownloadPlugin$b = "Nie udało się pobrać wtyczki: {0}";
    var errorFailedToStartThemeInstaller$b = "Nie udało się uruchomić instalatora...";
    var warningConflictingFiles$b = "Pliki w konflikcie";
    var warningThemeAlreadyInstalled$b = "Masz już zainstalowany ten motyw! Czy chcesz go przeinstalować? Twoje własne pliki zostaną utracone.";
    var errorFailedToUninstallTheme$b = "Nie udało się odinstalować motywu: {0}";
    var strNeverMind$b = "Nieważne";
    var strReinstall$b = "Przeinstaluj";
    var errorFailedToFetchTheme$b = "Nie udało się pobrać informacji o motywie: ";
    var errorFailedToFetchPlugin$b = "Nie udało się pobrać informacji o wtyczce: ";
    var errorInvalidID$b = "ID jest puste lub nieprawidłowe";
    var warnProceedInstallation$b = "Czy na pewno chcesz kontynuować instalację?";
    var strByAuthor$b = "Autor: {0}";
    var strUpdatingTheme$b = "Aktualizowanie motywu...";
    var strFinishedUpdating$b = "Aktualizacja zakończona!";
    var strPreparing$b = "Przygotowywanie...";
    var strUpdatingPlugin$b = "Aktualizowanie wtyczki...";
    var strComplete$b = "Ukończono!";
    var optionCheckForThemeAndPluginUpdates$b = "Sprawdzaj aktualizacje motywów i wtyczek";
    var optionWhenAPluginOrThemeUpdateIsAvailable$b = "Gdy dostępna jest aktualizacja wtyczki lub motywu";
    var headerOnStartup$b = "Przy uruchomieniu";
    var headerUpdates$b = "Aktualizacje";
    var headerNotifications$b = "Powiadomienia";
    var headerThemes$b = "Motywy";
    var optionInstallPlugin$b = "Zainstaluj wtyczkę";
    var optionInstallTheme$b = "Zainstaluj motyw";
    var optionBrowseLocalFiles$b = "Przeglądaj pliki lokalne";
    var strWelcomeModalTitle$b = "Witamy w Digitaldepot 👋";
    var strWelcomeModalDescription$b = "Twój Steam jest teraz zintegrowany z DigitalDepot!\n\nPonieważ po raz pierwszy uruchamiasz aplikację DigitalDepot, zacznijmy teraz Twoją podróż z nami!\n\nJeśli potrzebujesz pomocy, możesz rozmawiać na żywo bezpośrednio na [Digitaldepot](https://digitaldepot.id/) 💬\n\nCiesz się nowym doświadczeniem z DigitalDepot 🚀";
    var strWelcomeModalOKButton$b = "Rozumiem!";
    var strAbout$b = "O programie";
    var strAboutVersion$b = "Wersja Digitaldepot";
    var strAboutBuildDate$b = "Data kompilacji";
    var eOnMillenniumUpdateDoNothing$b = "Nic nie rób";
    var eOnMillenniumUpdateNotify$b = "Powiadom mnie";
    var eOnMillenniumUpdateAutoInstall$b = "Instaluj automatycznie";
    var optionCheckForMillenniumUpdates$b = "Sprawdzaj aktualizacje Digitaldepot";
    var optionWhenAnUpdateForMillenniumIsAvailable$b = "Gdy dostępna jest aktualizacja Digitaldepot";
    var strMillenniumUpdate$b = "Aktualizacje Digitaldepot";
    var toggleWantsMillenniumUpdates$b = "Czy Digitaldepot ma sprawdzać aktualizacje?";
    var toggleWantsMillenniumUpdatesTooltip$b = "Jeśli włączone, Digitaldepot automatycznie sprawdzi aktualizacje. Nie będą one instalowane automatycznie, chyba że wyłączysz powiadomienia. Otrzymasz okno z opcją aktualizacji lub odrzucenia.";
    var toggleWantsMillenniumUpdatesNotifications$b = "Czy chcesz otrzymywać powiadomienia o dostępnych aktualizacjach?";
    var toggleWantsMillenniumUpdatesNotificationsTooltip$b = "Jeśli sprawdzanie jest włączone i znajdzie aktualizację: przy włączonej opcji dostaniesz powiadomienie, przy wyłączonej — aktualizacja zainstaluje się automatycznie.";
    var tooltipCheckForMillenniumUpdates$b = "Sprawdzanie aktualizacji jest wyłączone, to ustawienie nie będzie działać.";
    var millenniumUpdateSuccessTitle$b = "Zaktualizowano pomyślnie!";
    var millenniumUpdateSuccessMessage$b = "Digitaldepot zostało pomyślnie zaktualizowane do {0}. Zmiany będą aktywne po ponownym uruchomieniu.";
    var polish = {
    	settingsPanelPlugins: settingsPanelPlugins$b,
    	settingsPanelThemes: settingsPanelThemes$b,
    	settingsPanelGeneral: settingsPanelGeneral$b,
    	settingsPanelUpdates: settingsPanelUpdates$b,
    	settingsPanelLogs: settingsPanelLogs$b,
    	settingsPanelSettings: settingsPanelSettings$b,
    	settingsPanelAbout: settingsPanelAbout$b,
    	settingsPanelBugReport: settingsPanelBugReport$b,
    	itemNoDescription: itemNoDescription$b,
    	themePanelClientTheme: themePanelClientTheme$b,
    	themePanelThemeTooltip: themePanelThemeTooltip$b,
    	pluginPanelPluginTooltip: pluginPanelPluginTooltip$b,
    	themePanelGetMoreThemes: themePanelGetMoreThemes$b,
    	pluginPanelGetMorePlugins: pluginPanelGetMorePlugins$b,
    	themePanelInjectJavascript: themePanelInjectJavascript$b,
    	themePanelInjectJavascriptToolTip: themePanelInjectJavascriptToolTip$b,
    	themePanelInjectCSS: themePanelInjectCSS$b,
    	themePanelInjectCSSToolTip: themePanelInjectCSSToolTip$b,
    	themePanelCustomAccentColor: themePanelCustomAccentColor$b,
    	themePanelCustomAccentColorToolTip: themePanelCustomAccentColorToolTip$b,
    	themePanelCustomColorNotUsed: themePanelCustomColorNotUsed$b,
    	themePanelCustomColorUsed: themePanelCustomColorUsed$b,
    	updatePanelHasUpdates: updatePanelHasUpdates$b,
    	updatePanelHasUpdatesSub: updatePanelHasUpdatesSub$b,
    	updatePanelReleasedTag: updatePanelReleasedTag$b,
    	updatePanelReleasePatchNotes: updatePanelReleasePatchNotes$b,
    	updatePanelIsUpdating: updatePanelIsUpdating$b,
    	updatePanelUpdate: updatePanelUpdate$b,
    	updatePanelNoUpdatesFoundHeader: updatePanelNoUpdatesFoundHeader$b,
    	updatePanelNoUpdatesFound: updatePanelNoUpdatesFound$b,
    	ViewMore: ViewMore$b,
    	aboutThemeAnonymous: aboutThemeAnonymous$b,
    	aboutThemeTitle: aboutThemeTitle$b,
    	aboutThemeVerifiedDev: aboutThemeVerifiedDev$b,
    	viewSourceCode: viewSourceCode$b,
    	showInFolder: showInFolder$b,
    	uninstall: uninstall$b,
    	optionSaveChanges: optionSaveChanges$b,
    	optionReloadNow: optionReloadNow$b,
    	optionReloadLater: optionReloadLater$b,
    	optionReloadRequired: optionReloadRequired$b,
    	optionPluginNeedsReload: optionPluginNeedsReload$b,
    	updatePanelUpdateNotifications: updatePanelUpdateNotifications$b,
    	updatePanelUpdateNotificationsTooltip: updatePanelUpdateNotificationsTooltip$b,
    	customThemeSettingsColors: customThemeSettingsColors$b,
    	customThemeSettingsConfig: customThemeSettingsConfig$b,
    	errorMessageTitle: errorMessageTitle$b,
    	errorSubmitIssueNotValid: errorSubmitIssueNotValid$b,
    	errorSubmitIssueNoDescription: errorSubmitIssueNoDescription$b,
    	errorSubmitIssueNoSteps: errorSubmitIssueNoSteps$b,
    	errorSubmitIssueTooFrequent: errorSubmitIssueTooFrequent$b,
    	updateSuccessful: updateSuccessful$b,
    	updateSuccessfulRestart: updateSuccessfulRestart$b,
    	updateFailed: updateFailed$b,
    	messageTitleWarning: messageTitleWarning$b,
    	messageUpdateDisableClarification: messageUpdateDisableClarification$b,
    	DisableUpdates: DisableUpdates$b,
    	DisableOnlyNotifications: DisableOnlyNotifications$b,
    	message1162025SecurityUpdate: message1162025SecurityUpdate$b,
    	message1162025SecurityUpdateTooltip: message1162025SecurityUpdateTooltip$b,
    	updateSecurityWarning: updateSecurityWarning$b,
    	settingsAreChangeableLater: settingsAreChangeableLater$b,
    	strViewUpdateDiffInBrowser: strViewUpdateDiffInBrowser$b,
    	strViewDownloadInfo: strViewDownloadInfo$b,
    	strUpdateNextStartup: strUpdateNextStartup$b,
    	strUpdateReject: strUpdateReject$b,
    	strDontShowAgain: strDontShowAgain$b,
    	strAnUpdateIsAvailable: strAnUpdateIsAvailable$b,
    	updatePanelCheckForUpdates: updatePanelCheckForUpdates$b,
    	updatePanelShowUpdateNotifications: updatePanelShowUpdateNotifications$b,
    	HoldOn: HoldOn$b,
    	updateFailedPluginRunning: updateFailedPluginRunning$b,
    	themeAndPluginUpdateNotification: themeAndPluginUpdateNotification$b,
    	updateSingular: updateSingular$b,
    	updatePlural: updatePlural$b,
    	updatePanelErrorHeader: updatePanelErrorHeader$b,
    	updatePanelErrorBody: updatePanelErrorBody$b,
    	updatePanelErrorButton: updatePanelErrorButton$b,
    	errorFailedConnection: errorFailedConnection$b,
    	errorFailedConnectionBody: errorFailedConnectionBody$b,
    	errorFailedConnectionButton: errorFailedConnectionButton$b,
    	strDone: strDone$b,
    	strUnknown: strUnknown$b,
    	strInstallPlugin: strInstallPlugin$b,
    	strSuccessfulInstall: strSuccessfulInstall$b,
    	strInstallComplete: strInstallComplete$b,
    	strInstallProgress: strInstallProgress$b,
    	strEnablePlugin: strEnablePlugin$b,
    	strUseThemeRequiresReload: strUseThemeRequiresReload$b,
    	strInvalidPluginBuildMessage: strInvalidPluginBuildMessage$b,
    	strInvalidPluginBuild: strInvalidPluginBuild$b,
    	strAlreadyInPluginLibrary: strAlreadyInPluginLibrary$b,
    	strAlreadyInstalled: strAlreadyInstalled$b,
    	errorFailedToDownloadPlugin: errorFailedToDownloadPlugin$b,
    	errorFailedToStartThemeInstaller: errorFailedToStartThemeInstaller$b,
    	warningConflictingFiles: warningConflictingFiles$b,
    	warningThemeAlreadyInstalled: warningThemeAlreadyInstalled$b,
    	errorFailedToUninstallTheme: errorFailedToUninstallTheme$b,
    	strNeverMind: strNeverMind$b,
    	strReinstall: strReinstall$b,
    	errorFailedToFetchTheme: errorFailedToFetchTheme$b,
    	errorFailedToFetchPlugin: errorFailedToFetchPlugin$b,
    	errorInvalidID: errorInvalidID$b,
    	warnProceedInstallation: warnProceedInstallation$b,
    	strByAuthor: strByAuthor$b,
    	strUpdatingTheme: strUpdatingTheme$b,
    	strFinishedUpdating: strFinishedUpdating$b,
    	strPreparing: strPreparing$b,
    	strUpdatingPlugin: strUpdatingPlugin$b,
    	strComplete: strComplete$b,
    	optionCheckForThemeAndPluginUpdates: optionCheckForThemeAndPluginUpdates$b,
    	optionWhenAPluginOrThemeUpdateIsAvailable: optionWhenAPluginOrThemeUpdateIsAvailable$b,
    	headerOnStartup: headerOnStartup$b,
    	headerUpdates: headerUpdates$b,
    	headerNotifications: headerNotifications$b,
    	headerThemes: headerThemes$b,
    	optionInstallPlugin: optionInstallPlugin$b,
    	optionInstallTheme: optionInstallTheme$b,
    	optionBrowseLocalFiles: optionBrowseLocalFiles$b,
    	strWelcomeModalTitle: strWelcomeModalTitle$b,
    	strWelcomeModalDescription: strWelcomeModalDescription$b,
    	strWelcomeModalOKButton: strWelcomeModalOKButton$b,
    	strAbout: strAbout$b,
    	strAboutVersion: strAboutVersion$b,
    	strAboutBuildDate: strAboutBuildDate$b,
    	eOnMillenniumUpdateDoNothing: eOnMillenniumUpdateDoNothing$b,
    	eOnMillenniumUpdateNotify: eOnMillenniumUpdateNotify$b,
    	eOnMillenniumUpdateAutoInstall: eOnMillenniumUpdateAutoInstall$b,
    	optionCheckForMillenniumUpdates: optionCheckForMillenniumUpdates$b,
    	optionWhenAnUpdateForMillenniumIsAvailable: optionWhenAnUpdateForMillenniumIsAvailable$b,
    	strMillenniumUpdate: strMillenniumUpdate$b,
    	toggleWantsMillenniumUpdates: toggleWantsMillenniumUpdates$b,
    	toggleWantsMillenniumUpdatesTooltip: toggleWantsMillenniumUpdatesTooltip$b,
    	toggleWantsMillenniumUpdatesNotifications: toggleWantsMillenniumUpdatesNotifications$b,
    	toggleWantsMillenniumUpdatesNotificationsTooltip: toggleWantsMillenniumUpdatesNotificationsTooltip$b,
    	tooltipCheckForMillenniumUpdates: tooltipCheckForMillenniumUpdates$b,
    	millenniumUpdateSuccessTitle: millenniumUpdateSuccessTitle$b,
    	millenniumUpdateSuccessMessage: millenniumUpdateSuccessMessage$b
    };

    var settingsPanelPlugins$a = "Complementos";
    var settingsPanelThemes$a = "Temas";
    var settingsPanelUpdates$a = "Actualizaciones";
    var settingsPanelLogs$a = "Registros";
    var settingsPanelSettings$a = "Ajustes";
    var settingsPanelAbout$a = "Información";
    var settingsPanelBugReport$a = "Reportar un error";
    var itemNoDescription$a = "Sin Descripción.";
    var themePanelClientTheme$a = "Tema del Cliente";
    var themePanelThemeTooltip$a = "Selecciona el tema que quieres que Steam use (requiere reiniciar)";
    var pluginPanelPluginTooltip$a = "¿No tienes ningún complemento instalado? ";
    var themePanelGetMoreThemes$a = "Conseguir más temas";
    var pluginPanelGetMorePlugins$a = "Conseguir complementos aquí";
    var themePanelInjectJavascript$a = "Inyectar JavaScript";
    var themePanelInjectJavascriptToolTip$a = "Decidir que temas tienen permiso para insertar JavaScript en Steam. Deshabilitar JavaScript puede romper la interfaz de Steam como consecuencia (requiere reiniciar)";
    var themePanelInjectCSS$a = "Inyectar Hojas de Estilo";
    var themePanelInjectCSSToolTip$a = "Decidir que temas tienen permiso para insertar hojas de estilo en Steam. (requiere reiniciar)";
    var themePanelCustomAccentColor$a = "Color Personalizado";
    var themePanelCustomAccentColorToolTip$a = "Selecciona un color personalizado para los temas que lo soporten (requiere reiniciar)";
    var themePanelCustomColorNotUsed$a = "Nota: El tema activo NO utiliza este ajuste.";
    var themePanelCustomColorUsed$a = "Nota: ¡El tema activo utiliza este ajuste!";
    var updatePanelHasUpdates$a = "¡Actualizaciones Disponibles!";
    var updatePanelHasUpdatesSub$a = "Digitaldepot ha encontrado las siguientes actualizaciones para tus temas.";
    var updatePanelReleasedTag$a = "Publicado:";
    var updatePanelReleasePatchNotes$a = "Notas de Parche:";
    var updatePanelIsUpdating$a = "Actualizando...";
    var updatePanelUpdate$a = "Actualizar";
    var updatePanelNoUpdatesFound$a = "No se han encontrado actualizaciones. ¡Todo listo!";
    var ViewMore$a = "Ver más";
    var aboutThemeAnonymous$a = "Anónimo";
    var aboutThemeTitle$a = "Información";
    var aboutThemeVerifiedDev$a = "Desarrollador Verificado";
    var viewSourceCode$a = "Ver Código Fuente";
    var showInFolder$a = "Mostrar en Carpeta";
    var uninstall$a = "Desinstalar";
    var optionSaveChanges$a = "Guardar Cambios";
    var optionReloadNow$a = "Reiniciar Ahora";
    var optionReloadLater$a = "Reiniciar Después";
    var optionReloadRequired$a = "Se requiere reiniciar";
    var optionPluginNeedsReload$a = "Para activar o desactivar los complementos seleccionados, se requiere reiniciar. ¿Estás seguro que quieres continuar?";
    var updatePanelUpdateNotifications$a = "Notificaciones";
    var updatePanelUpdateNotificationsTooltip$a = "Haz que Digitaldepot te notifique cuando un archivo en tu biblioteca tenga una actualización";
    var customThemeSettingsColors$a = "Colores";
    var customThemeSettingsConfig$a = "Ajustes Personalizados";
    var errorMessageTitle$a = "¡Ups!";
    var errorSubmitIssueNotValid$a = "Tu reporte no es válido. Asegurate que tu reporte no sea sobre un complemento o tema, si lo es, por favor contacta con el desarrollador del complemento o tema.";
    var errorSubmitIssueNoDescription$a = "Por favor indica tu problema (10 letras o más).";
    var errorSubmitIssueNoSteps$a = "Por favor explica cómo reproducir tu problema (10 letras o más).";
    var errorSubmitIssueTooFrequent$a = "¡Alto ahí! Estás haciendo reportes demasiado rápido. Por favor espera un poco antes de volver a hacer otro reporte.";
    var updateSuccessful$a = "Actualizado correctamente {0}";
    var updateSuccessfulRestart$a = "¡Actualizado correctamente {0}! Como lo tienes activo, tienes que reiniciar Steam para que los cambios tengan efecto.";
    var updateFailed$a = "¡Error al actualizar {0}! Comprueba los registros para mas información.";
    var messageTitleWarning$a = "¡Un segundo!";
    var messageUpdateDisableClarification$a = "¿Quieres desactivar la búsqueda de actualizaciones por completo, o solo desactivar las notificaciones de actualizaciones? Puedes cambiarlo en Ajustes de Digitaldepot más adelante.";
    var DisableUpdates$a = "Desactivar Actualizaciones";
    var DisableOnlyNotifications$a = "Solo Notificaciones";
    var message1162025SecurityUpdate$a = "Hemos decidido actualizar los protocolos de seguridad para beneficiar tanto a ti como a la comunidad. A partir del 27/3/2025, hemos decidido implantar medidas para preguntar directamente si quieres recibir actualizaciones de Digitaldepot.";
    var message1162025SecurityUpdateTooltip$a = "Estas actualizaciones son solo de Digitaldepot, no de temas y complementos, las cuales se gestionan por separado y nunca fueron automáticas.";
    var updateSecurityWarning$a = "Es recomendable mantener estos ajustes activados, porque te asegura estar siempre en la última version con los últimos parches de seguridad. No mantener Digitaldepot actualizado, puede resultar en vulnerabilidades en la seguridad, opciones que no funcionan, u otros problemas.";
    var settingsAreChangeableLater$a = "Puedes cambiar estos ajustes más tarde en Ajustes de Digitaldepot.";
    var strViewUpdateDiffInBrowser$a = "Abrir Diff en el Navegador";
    var strViewDownloadInfo$a = "Ver Información de la Descarga";
    var strUpdateNextStartup$a = "Actualizar en el siguiente Inicio";
    var strUpdateReject$a = "Rechazar";
    var strDontShowAgain$a = "No mostrar otra vez";
    var strAnUpdateIsAvailable$a = "¡Hay disponible una actualización para Digitaldepot! Estamos mostrándote este mensaje porque tienes activado el ajuste de recibir actualizaciones. Si ya no quieres recibir estos mensajes, puedes activar las actualizaciones automáticas, o puedes desactivar por completo las actualizaciones desde Ajustes de Digitaldepotn.";
    var updatePanelCheckForUpdates$a = "Comprobar Actualizaciones";
    var updatePanelShowUpdateNotifications$a = "Mostrar Notificaciones de Actualizaciones";
    var strWelcomeModalTitle$a = "Bienvenido a Digitaldepot 👋";
    var strWelcomeModalDescription$a = "¡Tu Steam ahora está integrado con DigitalDepot!\n\n¡Como es la primera vez que ejecutas la aplicación DigitalDepot, comencemos tu viaje con nosotros ahora mismo!\n\nSi necesitas ayuda, puedes chatear en vivo directamente en [Digitaldepot](https://digitaldepot.id/) 💬\n\n¡Disfruta de tu nueva experiencia con DigitalDepot 🚀";
    var strWelcomeModalOKButton$a = "¡Entendido!";
    var settingsPanelGeneral$a = "General";
    var eOnMillenniumUpdateDoNothing$a = "No hacer nada";
    var eOnMillenniumUpdateNotify$a = "Notificarme";
    var eOnMillenniumUpdateAutoInstall$a = "Instalar automáticamente";
    var errorFailedConnection$a = "¡Fallo al conectar con Digitaldepot!";
    var errorFailedConnectionBody$a = "Este problema no está relacionado con la red, probablemente te falta un archivo que Digitaldepot necesita, o estás experimentando un error inesperado.";
    var errorFailedConnectionButton$a = "Abrir Carpeta de Registros";
    var errorFailedToDownloadPlugin$a = "Fallo al descargar el complemento: {0}";
    var errorFailedToFetchPlugin$a = "Fallo al obtener información del complemento: ";
    var errorFailedToFetchTheme$a = "Fallo al obtener información del tema: ";
    var errorFailedToStartThemeInstaller$a = "Fallo al iniciar el módulo de instalación interno...";
    var errorFailedToUninstallTheme$a = "Fallo al desinstalar el tema: {0}";
    var errorInvalidID$a = "El ID está vacío o no es válido";
    var headerNotifications$a = "Notificaciones";
    var headerOnStartup$a = "Al Iniciar";
    var headerThemes$a = "Temas";
    var headerUpdates$a = "Actualizaciones";
    var HoldOn$a = "¡Espera!";
    var millenniumUpdateSuccessMessage$a = "¡Digitaldepot se ha actualizado correctamente a {0}! Los cambios tendrán efecto después de reiniciar.";
    var millenniumUpdateSuccessTitle$a = "¡Actualizado correctamente!";
    var optionBrowseLocalFiles$a = "Explorar archivos locales";
    var optionCheckForMillenniumUpdates$a = "Buscar actualizaciones de Digitaldepot";
    var optionCheckForThemeAndPluginUpdates$a = "Buscar actualizaciones de temas y complementos";
    var optionInstallPlugin$a = "Instalar un complemento";
    var optionInstallTheme$a = "Instalar un tema";
    var optionWhenAnUpdateForMillenniumIsAvailable$a = "Cuando hay una actualización disponible para Digitaldepot";
    var optionWhenAPluginOrThemeUpdateIsAvailable$a = "Cuando hay una actualización de complemento o tema disponible";
    var strAbout$a = "Información";
    var strAboutBuildDate$a = "Fecha de compilación de Digitaldepot";
    var strAboutVersion$a = "Versión de Digitaldepot";
    var strAlreadyInPluginLibrary$a = "¡{0} ya está en tu biblioteca de complementos!";
    var strAlreadyInstalled$a = "Ya instalado";
    var strByAuthor$a = "Por {0}";
    var strComplete$a = "¡Completo!";
    var strDone$a = "Hecho";
    var strEnablePlugin$a = "Activar Complemento (Requiere Reiniciar)";
    var strFinishedUpdating$a = "¡Actualización terminada!";
    var strInstallComplete$a = "Instalación Completa";
    var strInstallPlugin$a = "Instalar {0}";
    var strInstallProgress$a = "Progreso de Instalación";
    var strInvalidPluginBuild$a = "Compilación Inválida";
    var strInvalidPluginBuildMessage$a = "Este complemento no tiene una compilación válida para tu sistema operativo.";
    var strMillenniumUpdate$a = "Actualizaciones de Digitaldepot";
    var strNeverMind$a = "Olvidalo";
    var strPreparing$a = "Preparando...";
    var strReinstall$a = "Reinstalar";
    var strSuccessfulInstall$a = "¡{0} instalado correctamente!";
    var strUnknown$a = "Desconocido";
    var strUpdatingPlugin$a = "Actualizando complemento...";
    var strUpdatingTheme$a = "Actualizando tema...";
    var strUseThemeRequiresReload$a = "Usar Tema (Requiere Reiniciar)";
    var themeAndPluginUpdateNotification$a = "Digitaldepot ha encontrado {0} {1} disponible(s)";
    var toggleWantsMillenniumUpdates$a = "¿Quieres que Digitaldepot busque actualizaciones?";
    var toggleWantsMillenniumUpdatesNotifications$a = "¿Quieres ser notificado cuando se encuentren actualizaciones? (similar a este aviso)";
    var toggleWantsMillenniumUpdatesNotificationsTooltip$a = "Si buscar actualizaciones esta activado, se encuentra una actualización, y este ajuste esta activado, recibirás un aviso con la opción de actualizar o mantenerte en la versión en la que ya estás. Si buscar actualizaciones esta activado, se encuentra una actualización, y NO tienes este ajuste activado, no recibirás un aviso y la actualización se aplicará automáticamente.";
    var toggleWantsMillenniumUpdatesTooltip$a = "Si está activado, Digitaldepot buscará automáticamente actualizaciones. Las actualizaciones no se aplicarán automáticamente a menos que desactives las notificaciones (el ajuste de abajo). Recibirás un aviso con la opción de actualizar o mantener.";
    var tooltipCheckForMillenniumUpdates$a = "La búsqueda de actualizaciones está desactivada, este ajuste no tendrá efecto.";
    var updateFailedPluginRunning$a = "Digitaldepot no puede actualizar \"{0}\" mientras está en ejecución, necesitas desactivarlo primero.";
    var updatePanelErrorBody$a = "Por favor comprueba tu conexión a Internet e inténtalo de nuevo.";
    var updatePanelErrorButton$a = "Reintentar";
    var updatePanelErrorHeader$a = "¡Ha ocurrido un error al buscar actualizaciones!";
    var updatePanelNoUpdatesFoundHeader$a = "Sin actualizaciones";
    var updatePlural$a = "actualizaciones";
    var updateSingular$a = "actualización";
    var warningConflictingFiles$a = "Archivos en Conflicto";
    var warningThemeAlreadyInstalled$a = "¡Ya tienes este tema instalado! ¿Quieres reinstalarlo? Si has añadido archivos personalizados, sus datos se perderán.";
    var warnProceedInstallation$a = "¿Estás seguro de que quieres continuar con la instalación?";
    var spanish = {
    	settingsPanelPlugins: settingsPanelPlugins$a,
    	settingsPanelThemes: settingsPanelThemes$a,
    	settingsPanelUpdates: settingsPanelUpdates$a,
    	settingsPanelLogs: settingsPanelLogs$a,
    	settingsPanelSettings: settingsPanelSettings$a,
    	settingsPanelAbout: settingsPanelAbout$a,
    	settingsPanelBugReport: settingsPanelBugReport$a,
    	itemNoDescription: itemNoDescription$a,
    	themePanelClientTheme: themePanelClientTheme$a,
    	themePanelThemeTooltip: themePanelThemeTooltip$a,
    	pluginPanelPluginTooltip: pluginPanelPluginTooltip$a,
    	themePanelGetMoreThemes: themePanelGetMoreThemes$a,
    	pluginPanelGetMorePlugins: pluginPanelGetMorePlugins$a,
    	themePanelInjectJavascript: themePanelInjectJavascript$a,
    	themePanelInjectJavascriptToolTip: themePanelInjectJavascriptToolTip$a,
    	themePanelInjectCSS: themePanelInjectCSS$a,
    	themePanelInjectCSSToolTip: themePanelInjectCSSToolTip$a,
    	themePanelCustomAccentColor: themePanelCustomAccentColor$a,
    	themePanelCustomAccentColorToolTip: themePanelCustomAccentColorToolTip$a,
    	themePanelCustomColorNotUsed: themePanelCustomColorNotUsed$a,
    	themePanelCustomColorUsed: themePanelCustomColorUsed$a,
    	updatePanelHasUpdates: updatePanelHasUpdates$a,
    	updatePanelHasUpdatesSub: updatePanelHasUpdatesSub$a,
    	updatePanelReleasedTag: updatePanelReleasedTag$a,
    	updatePanelReleasePatchNotes: updatePanelReleasePatchNotes$a,
    	updatePanelIsUpdating: updatePanelIsUpdating$a,
    	updatePanelUpdate: updatePanelUpdate$a,
    	updatePanelNoUpdatesFound: updatePanelNoUpdatesFound$a,
    	ViewMore: ViewMore$a,
    	aboutThemeAnonymous: aboutThemeAnonymous$a,
    	aboutThemeTitle: aboutThemeTitle$a,
    	aboutThemeVerifiedDev: aboutThemeVerifiedDev$a,
    	viewSourceCode: viewSourceCode$a,
    	showInFolder: showInFolder$a,
    	uninstall: uninstall$a,
    	optionSaveChanges: optionSaveChanges$a,
    	optionReloadNow: optionReloadNow$a,
    	optionReloadLater: optionReloadLater$a,
    	optionReloadRequired: optionReloadRequired$a,
    	optionPluginNeedsReload: optionPluginNeedsReload$a,
    	updatePanelUpdateNotifications: updatePanelUpdateNotifications$a,
    	updatePanelUpdateNotificationsTooltip: updatePanelUpdateNotificationsTooltip$a,
    	customThemeSettingsColors: customThemeSettingsColors$a,
    	customThemeSettingsConfig: customThemeSettingsConfig$a,
    	errorMessageTitle: errorMessageTitle$a,
    	errorSubmitIssueNotValid: errorSubmitIssueNotValid$a,
    	errorSubmitIssueNoDescription: errorSubmitIssueNoDescription$a,
    	errorSubmitIssueNoSteps: errorSubmitIssueNoSteps$a,
    	errorSubmitIssueTooFrequent: errorSubmitIssueTooFrequent$a,
    	updateSuccessful: updateSuccessful$a,
    	updateSuccessfulRestart: updateSuccessfulRestart$a,
    	updateFailed: updateFailed$a,
    	messageTitleWarning: messageTitleWarning$a,
    	messageUpdateDisableClarification: messageUpdateDisableClarification$a,
    	DisableUpdates: DisableUpdates$a,
    	DisableOnlyNotifications: DisableOnlyNotifications$a,
    	message1162025SecurityUpdate: message1162025SecurityUpdate$a,
    	message1162025SecurityUpdateTooltip: message1162025SecurityUpdateTooltip$a,
    	updateSecurityWarning: updateSecurityWarning$a,
    	settingsAreChangeableLater: settingsAreChangeableLater$a,
    	strViewUpdateDiffInBrowser: strViewUpdateDiffInBrowser$a,
    	strViewDownloadInfo: strViewDownloadInfo$a,
    	strUpdateNextStartup: strUpdateNextStartup$a,
    	strUpdateReject: strUpdateReject$a,
    	strDontShowAgain: strDontShowAgain$a,
    	strAnUpdateIsAvailable: strAnUpdateIsAvailable$a,
    	updatePanelCheckForUpdates: updatePanelCheckForUpdates$a,
    	updatePanelShowUpdateNotifications: updatePanelShowUpdateNotifications$a,
    	strWelcomeModalTitle: strWelcomeModalTitle$a,
    	strWelcomeModalDescription: strWelcomeModalDescription$a,
    	strWelcomeModalOKButton: strWelcomeModalOKButton$a,
    	settingsPanelGeneral: settingsPanelGeneral$a,
    	eOnMillenniumUpdateDoNothing: eOnMillenniumUpdateDoNothing$a,
    	eOnMillenniumUpdateNotify: eOnMillenniumUpdateNotify$a,
    	eOnMillenniumUpdateAutoInstall: eOnMillenniumUpdateAutoInstall$a,
    	errorFailedConnection: errorFailedConnection$a,
    	errorFailedConnectionBody: errorFailedConnectionBody$a,
    	errorFailedConnectionButton: errorFailedConnectionButton$a,
    	errorFailedToDownloadPlugin: errorFailedToDownloadPlugin$a,
    	errorFailedToFetchPlugin: errorFailedToFetchPlugin$a,
    	errorFailedToFetchTheme: errorFailedToFetchTheme$a,
    	errorFailedToStartThemeInstaller: errorFailedToStartThemeInstaller$a,
    	errorFailedToUninstallTheme: errorFailedToUninstallTheme$a,
    	errorInvalidID: errorInvalidID$a,
    	headerNotifications: headerNotifications$a,
    	headerOnStartup: headerOnStartup$a,
    	headerThemes: headerThemes$a,
    	headerUpdates: headerUpdates$a,
    	HoldOn: HoldOn$a,
    	millenniumUpdateSuccessMessage: millenniumUpdateSuccessMessage$a,
    	millenniumUpdateSuccessTitle: millenniumUpdateSuccessTitle$a,
    	optionBrowseLocalFiles: optionBrowseLocalFiles$a,
    	optionCheckForMillenniumUpdates: optionCheckForMillenniumUpdates$a,
    	optionCheckForThemeAndPluginUpdates: optionCheckForThemeAndPluginUpdates$a,
    	optionInstallPlugin: optionInstallPlugin$a,
    	optionInstallTheme: optionInstallTheme$a,
    	optionWhenAnUpdateForMillenniumIsAvailable: optionWhenAnUpdateForMillenniumIsAvailable$a,
    	optionWhenAPluginOrThemeUpdateIsAvailable: optionWhenAPluginOrThemeUpdateIsAvailable$a,
    	strAbout: strAbout$a,
    	strAboutBuildDate: strAboutBuildDate$a,
    	strAboutVersion: strAboutVersion$a,
    	strAlreadyInPluginLibrary: strAlreadyInPluginLibrary$a,
    	strAlreadyInstalled: strAlreadyInstalled$a,
    	strByAuthor: strByAuthor$a,
    	strComplete: strComplete$a,
    	strDone: strDone$a,
    	strEnablePlugin: strEnablePlugin$a,
    	strFinishedUpdating: strFinishedUpdating$a,
    	strInstallComplete: strInstallComplete$a,
    	strInstallPlugin: strInstallPlugin$a,
    	strInstallProgress: strInstallProgress$a,
    	strInvalidPluginBuild: strInvalidPluginBuild$a,
    	strInvalidPluginBuildMessage: strInvalidPluginBuildMessage$a,
    	strMillenniumUpdate: strMillenniumUpdate$a,
    	strNeverMind: strNeverMind$a,
    	strPreparing: strPreparing$a,
    	strReinstall: strReinstall$a,
    	strSuccessfulInstall: strSuccessfulInstall$a,
    	strUnknown: strUnknown$a,
    	strUpdatingPlugin: strUpdatingPlugin$a,
    	strUpdatingTheme: strUpdatingTheme$a,
    	strUseThemeRequiresReload: strUseThemeRequiresReload$a,
    	themeAndPluginUpdateNotification: themeAndPluginUpdateNotification$a,
    	toggleWantsMillenniumUpdates: toggleWantsMillenniumUpdates$a,
    	toggleWantsMillenniumUpdatesNotifications: toggleWantsMillenniumUpdatesNotifications$a,
    	toggleWantsMillenniumUpdatesNotificationsTooltip: toggleWantsMillenniumUpdatesNotificationsTooltip$a,
    	toggleWantsMillenniumUpdatesTooltip: toggleWantsMillenniumUpdatesTooltip$a,
    	tooltipCheckForMillenniumUpdates: tooltipCheckForMillenniumUpdates$a,
    	updateFailedPluginRunning: updateFailedPluginRunning$a,
    	updatePanelErrorBody: updatePanelErrorBody$a,
    	updatePanelErrorButton: updatePanelErrorButton$a,
    	updatePanelErrorHeader: updatePanelErrorHeader$a,
    	updatePanelNoUpdatesFoundHeader: updatePanelNoUpdatesFoundHeader$a,
    	updatePlural: updatePlural$a,
    	updateSingular: updateSingular$a,
    	warningConflictingFiles: warningConflictingFiles$a,
    	warningThemeAlreadyInstalled: warningThemeAlreadyInstalled$a,
    	warnProceedInstallation: warnProceedInstallation$a
    };

    var settingsPanelPlugins$9 = "Plugin";
    var settingsPanelThemes$9 = "Tema";
    var settingsPanelGeneral$9 = "Umum";
    var settingsPanelUpdates$9 = "Pembaruan";
    var settingsPanelLogs$9 = "Log";
    var settingsPanelSettings$9 = "Pengaturan";
    var settingsPanelAbout$9 = "Tentang";
    var settingsPanelBugReport$9 = "Laporkan Bug";
    var itemNoDescription$9 = "Tidak ada deskripsi.";
    var themePanelClientTheme$9 = "Tema Klien";
    var themePanelThemeTooltip$9 = "Pilih tema yang akan digunakan Steam (perlu muat ulang)";
    var pluginPanelPluginTooltip$9 = "Belum ada plugin terpasang? ";
    var themePanelGetMoreThemes$9 = "Dapatkan lebih banyak tema";
    var pluginPanelGetMorePlugins$9 = "Cari plugin di sini";
    var themePanelInjectJavascript$9 = "Izinkan JavaScript";
    var themePanelInjectJavascriptToolTip$9 = "Tentukan apakah tema dapat menyisipkan JavaScript ke Steam. Menonaktifkan JavaScript dapat merusak antarmuka Steam (perlu muat ulang)";
    var themePanelInjectCSS$9 = "Izinkan StyleSheets";
    var themePanelInjectCSSToolTip$9 = "Tentukan apakah tema dapat menyisipkan stylesheet ke Steam. (perlu muat ulang)";
    var themePanelCustomAccentColor$9 = "Warna Aksen Kustom";
    var themePanelCustomAccentColorToolTip$9 = "Atur warna aksen kustom untuk tema yang mendukungnya (perlu muat ulang)";
    var themePanelCustomColorNotUsed$9 = "Catatan: Tema aktif TIDAK menggunakan pengaturan ini.";
    var themePanelCustomColorUsed$9 = "Catatan: Tema aktif menggunakan pengaturan ini!";
    var updatePanelHasUpdates$9 = "Pembaruan Tersedia!";
    var updatePanelHasUpdatesSub$9 = "Digitaldepot menemukan pembaruan berikut untuk Anda!";
    var updatePanelReleasedTag$9 = "Dirilis:";
    var updatePanelReleasePatchNotes$9 = "Catatan Patch:";
    var updatePanelIsUpdating$9 = "Memperbarui...";
    var updatePanelUpdate$9 = "Perbarui";
    var updatePanelNoUpdatesFoundHeader$9 = "Tidak Ada Pembaruan";
    var updatePanelNoUpdatesFound$9 = "Tidak ada pembaruan ditemukan. Semua sudah terbaru!";
    var ViewMore$9 = "Lihat Selengkapnya";
    var aboutThemeAnonymous$9 = "Anonim";
    var aboutThemeTitle$9 = "Tentang";
    var aboutThemeVerifiedDev$9 = "Pengembang Terverifikasi";
    var viewSourceCode$9 = "Lihat Kode Sumber";
    var showInFolder$9 = "Tampilkan di Folder";
    var uninstall$9 = "Hapus Instalasi";
    var optionSaveChanges$9 = "Simpan Perubahan";
    var optionReloadNow$9 = "Muat Ulang Sekarang";
    var optionReloadLater$9 = "Muat Ulang Nanti";
    var optionReloadRequired$9 = "Perlu Muat Ulang";
    var optionPluginNeedsReload$9 = "Untuk mengaktifkan atau menonaktifkan plugin yang dipilih, perlu muat ulang. Anda yakin ingin melanjutkan?";
    var updatePanelUpdateNotifications$9 = "Notifikasi Push";
    var updatePanelUpdateNotificationsTooltip$9 = "Biarkan Digitaldepot mengingatkan Anda saat ada item di perpustakaan Anda yang memiliki pembaruan!";
    var customThemeSettingsColors$9 = "Warna";
    var customThemeSettingsConfig$9 = "Pengaturan Kustom";
    var errorMessageTitle$9 = "Ups!";
    var errorSubmitIssueNotValid$9 = "Masalah Anda tidak valid. Pastikan masalah Anda tidak melibatkan plugin atau tema, jika ya, silakan hubungi pengembang plugin atau tema tersebut.";
    var errorSubmitIssueNoDescription$9 = "Harap berikan deskripsi masalah Anda (10 karakter atau lebih).";
    var errorSubmitIssueNoSteps$9 = "Harap berikan gambaran cara mereproduksi masalah Anda (10 karakter atau lebih).";
    var errorSubmitIssueTooFrequent$9 = "Wah! Anda mengirim masalah terlalu cepat. Harap tunggu sebentar sebelum mengirim masalah lain.";
    var updateSuccessful$9 = "Berhasil memperbarui {0}";
    var updateSuccessfulRestart$9 = "Berhasil memperbarui {0}! Karena sedang aktif, Anda perlu restart Steam agar perubahan berlaku.";
    var updateFailed$9 = "Gagal memperbarui {0}! Periksa log untuk informasi lebih lanjut.";
    var messageTitleWarning$9 = "Tunggu Sebentar!";
    var messageUpdateDisableClarification$9 = "Apakah Anda ingin menonaktifkan pemeriksaan pembaruan sepenuhnya, atau hanya menonaktifkan notifikasi pembaruan ini? Anda selalu dapat mengubahnya di Pengaturan Digitaldepot nanti.";
    var DisableUpdates$9 = "Nonaktifkan Pembaruan";
    var DisableOnlyNotifications$9 = "Hanya Notifikasi";
    var message1162025SecurityUpdate$9 = "Kami memutuskan untuk memperbarui protokol keamanan kami agar lebih bermanfaat bagi Anda dan komunitas secara keseluruhan. Mulai 27/03/2025, kami memutuskan untuk menerapkan langkah-langkah untuk secara eksplisit menanyakan apakah Anda ingin menerima pembaruan dari Digitaldepot.";
    var message1162025SecurityUpdateTooltip$9 = "Ini hanya pembaruan Digitaldepot, bukan pembaruan tema dan plugin, yang ditangani secara terpisah dan tidak pernah otomatis";
    var toggleWantsMillenniumUpdates$9 = "Apakah Anda ingin Digitaldepot memeriksa pembaruan?";
    var toggleWantsMillenniumUpdatesTooltip$9 = "Jika diaktifkan, Digitaldepot akan secara otomatis memeriksa pembaruan. Pembaruan TIDAK akan diterapkan secara otomatis kecuali Anda menonaktifkan notifikasi (pengaturan di bawah). Anda akan menerima kotak popup dengan opsi untuk memperbarui atau mengabaikan.";
    var toggleWantsMillenniumUpdatesNotifications$9 = "Apakah Anda ingin diberi tahu saat pembaruan ditemukan? (mirip popup ini)";
    var toggleWantsMillenniumUpdatesNotificationsTooltip$9 = "Jika pemeriksaan pembaruan aktif, pembaruan ditemukan, dan pengaturan ini aktif, Anda akan menerima kotak popup dengan opsi untuk memperbarui atau tetap di versi yang sudah Anda gunakan. Jika pemeriksaan pembaruan aktif, pembaruan ditemukan, dan Anda TIDAK mengaktifkan pengaturan ini, Anda tidak akan menerima kotak popup dan pembaruan akan diterapkan secara otomatis.";
    var updateSecurityWarning$9 = "Sangat disarankan untuk tetap mengaktifkan pengaturan ini, karena memastikan Anda selalu menggunakan perbaikan keamanan terbaru. Kegagalan menjaga Digitaldepot tetap diperbarui dapat mengakibatkan kerentanan keamanan, fitur rusak, atau masalah lainnya.";
    var settingsAreChangeableLater$9 = "Anda dapat mengubah pengaturan ini nanti di Pengaturan Digitaldepot.";
    var strViewUpdateDiffInBrowser$9 = "Lihat Diff di Browser";
    var strViewDownloadInfo$9 = "Lihat Info Unduhan";
    var strUpdateNextStartup$9 = "Perbarui Saat Startup Berikutnya";
    var strUpdateReject$9 = "Lewati";
    var strDontShowAgain$9 = "Jangan Tampilkan Lagi";
    var strAnUpdateIsAvailable$9 = "Pembaruan tersedia untuk Digitaldepot! Kami menampilkan pesan ini karena Anda telah memilih untuk menerima pembaruan. Jika Anda tidak ingin menerima pesan ini lagi, Anda dapat mengaktifkan pembaruan otomatis, atau menonaktifkan pembaruan sepenuhnya dari Pengaturan Digitaldepot.";
    var updatePanelCheckForUpdates$9 = "Periksa Pembaruan";
    var updatePanelShowUpdateNotifications$9 = "Tampilkan Notifikasi Pembaruan";
    var HoldOn$9 = "Tunggu Dulu!";
    var updateFailedPluginRunning$9 = "Digitaldepot tidak dapat memperbarui \"{0}\" saat sedang berjalan, Anda perlu menonaktifkannya terlebih dahulu.";
    var themeAndPluginUpdateNotification$9 = "Digitaldepot menemukan {0} {1} yang tersedia";
    var updateSingular$9 = "pembaruan";
    var updatePlural$9 = "pembaruan";
    var updatePanelErrorHeader$9 = "Terjadi kesalahan saat memeriksa pembaruan!";
    var updatePanelErrorBody$9 = "Harap periksa koneksi internet Anda dan coba lagi. ";
    var updatePanelErrorButton$9 = "Coba Lagi";
    var errorFailedConnection$9 = "Gagal terhubung ke Digitaldepot!";
    var errorFailedConnectionBody$9 = "Masalah ini tidak terkait jaringan, kemungkinan besar Anda kehilangan file yang dibutuhkan Digitaldepot atau mengalami bug yang tidak terduga.";
    var errorFailedConnectionButton$9 = "Buka Folder Log";
    var strDone$9 = "Selesai";
    var strUnknown$9 = "Tidak Diketahui";
    var strInstallPlugin$9 = "Instal {0}";
    var strSuccessfulInstall$9 = "Berhasil menginstal {0}!";
    var strInstallComplete$9 = "Instalasi Selesai";
    var strInstallProgress$9 = "Progres Instalasi";
    var strEnablePlugin$9 = "Aktifkan Plugin (Perlu Muat Ulang)";
    var strUseThemeRequiresReload$9 = "Gunakan Tema (Perlu Muat Ulang)";
    var strInvalidPluginBuildMessage$9 = "Plugin ini tidak memiliki build yang valid untuk sistem operasi Anda.";
    var strInvalidPluginBuild$9 = "Build Tidak Valid";
    var strAlreadyInPluginLibrary$9 = "{0} sudah ada di perpustakaan plugin Anda!";
    var strAlreadyInstalled$9 = "Sudah Terinstal";
    var errorFailedToDownloadPlugin$9 = "Gagal mengunduh plugin: {0}";
    var errorFailedToStartThemeInstaller$9 = "Gagal memulai modul penginstal internal...";
    var warningConflictingFiles$9 = "File Konflik";
    var warningThemeAlreadyInstalled$9 = "Anda sudah menginstal tema ini! Apakah Anda ingin menginstal ulang? Jika Anda menambahkan file kustom, datanya akan hilang.";
    var errorFailedToUninstallTheme$9 = "Gagal menghapus instalasi tema: {0}";
    var strNeverMind$9 = "Tidak Jadi";
    var strReinstall$9 = "Instal Ulang";
    var errorFailedToFetchTheme$9 = "Gagal mengambil info tema: ";
    var errorFailedToFetchPlugin$9 = "Gagal mengambil info plugin: ";
    var errorInvalidID$9 = "ID kosong atau tidak valid";
    var warnProceedInstallation$9 = "Apakah Anda yakin ingin melanjutkan instalasi?";
    var strMillenniumUpdate$9 = "Pembaruan Digitaldepot";
    var strByAuthor$9 = "Oleh {0}";
    var strUpdatingTheme$9 = "Memperbarui tema...";
    var strFinishedUpdating$9 = "Selesai memperbarui!";
    var strPreparing$9 = "Menyiapkan...";
    var strUpdatingPlugin$9 = "Memperbarui plugin...";
    var strComplete$9 = "Selesai!";
    var eOnMillenniumUpdateDoNothing$9 = "Tidak melakukan apa-apa";
    var eOnMillenniumUpdateNotify$9 = "Beri tahu saya";
    var eOnMillenniumUpdateAutoInstall$9 = "Instal otomatis";
    var optionCheckForMillenniumUpdates$9 = "Periksa pembaruan Digitaldepot";
    var optionCheckForThemeAndPluginUpdates$9 = "Periksa pembaruan tema & plugin";
    var optionWhenAnUpdateForMillenniumIsAvailable$9 = "Ketika pembaruan Digitaldepot tersedia";
    var optionWhenAPluginOrThemeUpdateIsAvailable$9 = "Ketika pembaruan plugin atau tema tersedia";
    var headerOnStartup$9 = "Saat Startup";
    var headerUpdates$9 = "Pembaruan";
    var headerNotifications$9 = "Notifikasi";
    var headerThemes$9 = "Tema";
    var optionInstallPlugin$9 = "Instal plugin";
    var optionInstallTheme$9 = "Instal tema";
    var optionBrowseLocalFiles$9 = "Jelajahi file lokal";
    var tooltipCheckForMillenniumUpdates$9 = "Pemeriksaan pembaruan dinonaktifkan, pengaturan ini tidak akan berlaku.";
    var strWelcomeModalTitle$9 = "Selamat Datang di Digitaldepot 👋";
    var strWelcomeModalDescription$9 = "Sekarang Steam kamu sudah terintegrasi dengan DigitalDepot!\n\nKarena ini pertama kalinya kamu menjalankan aplikasi DigitalDepot, yuk mulai perjalananmu bareng kami sekarang juga!\n\nKalau kamu butuh bantuan, kamu bisa live chat langsung di [Digitaldepot](https://digitaldepot.id/) 💬\n\nSelamat menikmati pengalaman baru bareng DigitalDepot 🚀";
    var strWelcomeModalOKButton$9 = "Mengerti!";
    var strAbout$9 = "Tentang";
    var strAboutVersion$9 = "Versi Digitaldepot";
    var strAboutBuildDate$9 = "Tanggal build Digitaldepot";
    var millenniumUpdateSuccessTitle$9 = "Berhasil diperbarui!";
    var millenniumUpdateSuccessMessage$9 = "Berhasil memperbarui Digitaldepot ke {0}. Perubahan akan berlaku setelah restart.";
    var indonesian = {
    	settingsPanelPlugins: settingsPanelPlugins$9,
    	settingsPanelThemes: settingsPanelThemes$9,
    	settingsPanelGeneral: settingsPanelGeneral$9,
    	settingsPanelUpdates: settingsPanelUpdates$9,
    	settingsPanelLogs: settingsPanelLogs$9,
    	settingsPanelSettings: settingsPanelSettings$9,
    	settingsPanelAbout: settingsPanelAbout$9,
    	settingsPanelBugReport: settingsPanelBugReport$9,
    	itemNoDescription: itemNoDescription$9,
    	themePanelClientTheme: themePanelClientTheme$9,
    	themePanelThemeTooltip: themePanelThemeTooltip$9,
    	pluginPanelPluginTooltip: pluginPanelPluginTooltip$9,
    	themePanelGetMoreThemes: themePanelGetMoreThemes$9,
    	pluginPanelGetMorePlugins: pluginPanelGetMorePlugins$9,
    	themePanelInjectJavascript: themePanelInjectJavascript$9,
    	themePanelInjectJavascriptToolTip: themePanelInjectJavascriptToolTip$9,
    	themePanelInjectCSS: themePanelInjectCSS$9,
    	themePanelInjectCSSToolTip: themePanelInjectCSSToolTip$9,
    	themePanelCustomAccentColor: themePanelCustomAccentColor$9,
    	themePanelCustomAccentColorToolTip: themePanelCustomAccentColorToolTip$9,
    	themePanelCustomColorNotUsed: themePanelCustomColorNotUsed$9,
    	themePanelCustomColorUsed: themePanelCustomColorUsed$9,
    	updatePanelHasUpdates: updatePanelHasUpdates$9,
    	updatePanelHasUpdatesSub: updatePanelHasUpdatesSub$9,
    	updatePanelReleasedTag: updatePanelReleasedTag$9,
    	updatePanelReleasePatchNotes: updatePanelReleasePatchNotes$9,
    	updatePanelIsUpdating: updatePanelIsUpdating$9,
    	updatePanelUpdate: updatePanelUpdate$9,
    	updatePanelNoUpdatesFoundHeader: updatePanelNoUpdatesFoundHeader$9,
    	updatePanelNoUpdatesFound: updatePanelNoUpdatesFound$9,
    	ViewMore: ViewMore$9,
    	aboutThemeAnonymous: aboutThemeAnonymous$9,
    	aboutThemeTitle: aboutThemeTitle$9,
    	aboutThemeVerifiedDev: aboutThemeVerifiedDev$9,
    	viewSourceCode: viewSourceCode$9,
    	showInFolder: showInFolder$9,
    	uninstall: uninstall$9,
    	optionSaveChanges: optionSaveChanges$9,
    	optionReloadNow: optionReloadNow$9,
    	optionReloadLater: optionReloadLater$9,
    	optionReloadRequired: optionReloadRequired$9,
    	optionPluginNeedsReload: optionPluginNeedsReload$9,
    	updatePanelUpdateNotifications: updatePanelUpdateNotifications$9,
    	updatePanelUpdateNotificationsTooltip: updatePanelUpdateNotificationsTooltip$9,
    	customThemeSettingsColors: customThemeSettingsColors$9,
    	customThemeSettingsConfig: customThemeSettingsConfig$9,
    	errorMessageTitle: errorMessageTitle$9,
    	errorSubmitIssueNotValid: errorSubmitIssueNotValid$9,
    	errorSubmitIssueNoDescription: errorSubmitIssueNoDescription$9,
    	errorSubmitIssueNoSteps: errorSubmitIssueNoSteps$9,
    	errorSubmitIssueTooFrequent: errorSubmitIssueTooFrequent$9,
    	updateSuccessful: updateSuccessful$9,
    	updateSuccessfulRestart: updateSuccessfulRestart$9,
    	updateFailed: updateFailed$9,
    	messageTitleWarning: messageTitleWarning$9,
    	messageUpdateDisableClarification: messageUpdateDisableClarification$9,
    	DisableUpdates: DisableUpdates$9,
    	DisableOnlyNotifications: DisableOnlyNotifications$9,
    	message1162025SecurityUpdate: message1162025SecurityUpdate$9,
    	message1162025SecurityUpdateTooltip: message1162025SecurityUpdateTooltip$9,
    	toggleWantsMillenniumUpdates: toggleWantsMillenniumUpdates$9,
    	toggleWantsMillenniumUpdatesTooltip: toggleWantsMillenniumUpdatesTooltip$9,
    	toggleWantsMillenniumUpdatesNotifications: toggleWantsMillenniumUpdatesNotifications$9,
    	toggleWantsMillenniumUpdatesNotificationsTooltip: toggleWantsMillenniumUpdatesNotificationsTooltip$9,
    	updateSecurityWarning: updateSecurityWarning$9,
    	settingsAreChangeableLater: settingsAreChangeableLater$9,
    	strViewUpdateDiffInBrowser: strViewUpdateDiffInBrowser$9,
    	strViewDownloadInfo: strViewDownloadInfo$9,
    	strUpdateNextStartup: strUpdateNextStartup$9,
    	strUpdateReject: strUpdateReject$9,
    	strDontShowAgain: strDontShowAgain$9,
    	strAnUpdateIsAvailable: strAnUpdateIsAvailable$9,
    	updatePanelCheckForUpdates: updatePanelCheckForUpdates$9,
    	updatePanelShowUpdateNotifications: updatePanelShowUpdateNotifications$9,
    	HoldOn: HoldOn$9,
    	updateFailedPluginRunning: updateFailedPluginRunning$9,
    	themeAndPluginUpdateNotification: themeAndPluginUpdateNotification$9,
    	updateSingular: updateSingular$9,
    	updatePlural: updatePlural$9,
    	updatePanelErrorHeader: updatePanelErrorHeader$9,
    	updatePanelErrorBody: updatePanelErrorBody$9,
    	updatePanelErrorButton: updatePanelErrorButton$9,
    	errorFailedConnection: errorFailedConnection$9,
    	errorFailedConnectionBody: errorFailedConnectionBody$9,
    	errorFailedConnectionButton: errorFailedConnectionButton$9,
    	strDone: strDone$9,
    	strUnknown: strUnknown$9,
    	strInstallPlugin: strInstallPlugin$9,
    	strSuccessfulInstall: strSuccessfulInstall$9,
    	strInstallComplete: strInstallComplete$9,
    	strInstallProgress: strInstallProgress$9,
    	strEnablePlugin: strEnablePlugin$9,
    	strUseThemeRequiresReload: strUseThemeRequiresReload$9,
    	strInvalidPluginBuildMessage: strInvalidPluginBuildMessage$9,
    	strInvalidPluginBuild: strInvalidPluginBuild$9,
    	strAlreadyInPluginLibrary: strAlreadyInPluginLibrary$9,
    	strAlreadyInstalled: strAlreadyInstalled$9,
    	errorFailedToDownloadPlugin: errorFailedToDownloadPlugin$9,
    	errorFailedToStartThemeInstaller: errorFailedToStartThemeInstaller$9,
    	warningConflictingFiles: warningConflictingFiles$9,
    	warningThemeAlreadyInstalled: warningThemeAlreadyInstalled$9,
    	errorFailedToUninstallTheme: errorFailedToUninstallTheme$9,
    	strNeverMind: strNeverMind$9,
    	strReinstall: strReinstall$9,
    	errorFailedToFetchTheme: errorFailedToFetchTheme$9,
    	errorFailedToFetchPlugin: errorFailedToFetchPlugin$9,
    	errorInvalidID: errorInvalidID$9,
    	warnProceedInstallation: warnProceedInstallation$9,
    	strMillenniumUpdate: strMillenniumUpdate$9,
    	strByAuthor: strByAuthor$9,
    	strUpdatingTheme: strUpdatingTheme$9,
    	strFinishedUpdating: strFinishedUpdating$9,
    	strPreparing: strPreparing$9,
    	strUpdatingPlugin: strUpdatingPlugin$9,
    	strComplete: strComplete$9,
    	eOnMillenniumUpdateDoNothing: eOnMillenniumUpdateDoNothing$9,
    	eOnMillenniumUpdateNotify: eOnMillenniumUpdateNotify$9,
    	eOnMillenniumUpdateAutoInstall: eOnMillenniumUpdateAutoInstall$9,
    	optionCheckForMillenniumUpdates: optionCheckForMillenniumUpdates$9,
    	optionCheckForThemeAndPluginUpdates: optionCheckForThemeAndPluginUpdates$9,
    	optionWhenAnUpdateForMillenniumIsAvailable: optionWhenAnUpdateForMillenniumIsAvailable$9,
    	optionWhenAPluginOrThemeUpdateIsAvailable: optionWhenAPluginOrThemeUpdateIsAvailable$9,
    	headerOnStartup: headerOnStartup$9,
    	headerUpdates: headerUpdates$9,
    	headerNotifications: headerNotifications$9,
    	headerThemes: headerThemes$9,
    	optionInstallPlugin: optionInstallPlugin$9,
    	optionInstallTheme: optionInstallTheme$9,
    	optionBrowseLocalFiles: optionBrowseLocalFiles$9,
    	tooltipCheckForMillenniumUpdates: tooltipCheckForMillenniumUpdates$9,
    	strWelcomeModalTitle: strWelcomeModalTitle$9,
    	strWelcomeModalDescription: strWelcomeModalDescription$9,
    	strWelcomeModalOKButton: strWelcomeModalOKButton$9,
    	strAbout: strAbout$9,
    	strAboutVersion: strAboutVersion$9,
    	strAboutBuildDate: strAboutBuildDate$9,
    	millenniumUpdateSuccessTitle: millenniumUpdateSuccessTitle$9,
    	millenniumUpdateSuccessMessage: millenniumUpdateSuccessMessage$9
    };

    var settingsPanelPlugins$8 = "插件";
    var settingsPanelThemes$8 = "主题";
    var settingsPanelGeneral$8 = "常规";
    var settingsPanelUpdates$8 = "更新";
    var settingsPanelLogs$8 = "日志";
    var settingsPanelSettings$8 = "设置";
    var settingsPanelAbout$8 = "关于";
    var settingsPanelBugReport$8 = "反馈 Bug";
    var itemNoDescription$8 = "暂无描述";
    var themePanelClientTheme$8 = "客户端主题";
    var themePanelThemeTooltip$8 = "选择你想要使用的 Steam 主题 (需要重新加载)";
    var pluginPanelPluginTooltip$8 = "还没有安装插件？";
    var themePanelGetMoreThemes$8 = "获取更多主题";
    var pluginPanelGetMorePlugins$8 = "获取更多插件";
    var themePanelInjectJavascript$8 = "允许注入 JavaScript";
    var themePanelInjectJavascriptToolTip$8 = "决定是否允许主题在 Steam 中插入 JavaScript。禁用 JavaScript 可能会导致 Steam 界面出现问题 (需要重新加载)";
    var themePanelInjectCSS$8 = "允许注入 CSS";
    var themePanelInjectCSSToolTip$8 = "决定是否允许主题在 Steam 中插入 CSS (需要重新加载)";
    var themePanelCustomAccentColor$8 = "自定义强调色";
    var themePanelCustomAccentColorToolTip$8 = "覆盖 Steam 内的系统强调色。除非主题使用系统强调色，否则此设置不会生效。";
    var themePanelCustomColorNotUsed$8 = "注意：当前主题未使用此设置。";
    var themePanelCustomColorUsed$8 = "注意: 当前启用的主题适用该设置！";
    var updatePanelHasUpdates$8 = "更新可用！";
    var updatePanelHasUpdatesSub$8 = "Digitaldepot 为您找到了以下更新！";
    var updatePanelReleasedTag$8 = "发布于：";
    var updatePanelReleasePatchNotes$8 = "补丁说明：";
    var updatePanelIsUpdating$8 = "更新中...";
    var updatePanelUpdate$8 = "更新";
    var updatePanelNoUpdatesFoundHeader$8 = "无可用更新";
    var updatePanelNoUpdatesFound$8 = "没有可用的更新。一切都已是最新！";
    var ViewMore$8 = "查看更多";
    var aboutThemeAnonymous$8 = "匿名";
    var aboutThemeTitle$8 = "关于";
    var aboutThemeVerifiedDev$8 = "经过验证的开发者";
    var viewSourceCode$8 = "查看源码";
    var showInFolder$8 = "打开文件位置";
    var uninstall$8 = "卸载";
    var optionSaveChanges$8 = "保存更改";
    var optionReloadNow$8 = "立即重新加载";
    var optionReloadLater$8 = "稍后重新加载";
    var optionReloadRequired$8 = "需要重新加载";
    var optionPluginNeedsReload$8 = "要启用或禁用当前选择的插件，需要进行重新加载。你确定要继续吗？";
    var updatePanelUpdateNotifications$8 = "显示通知消息";
    var updatePanelUpdateNotificationsTooltip$8 = "当你的库中有项目（主题或插件）可更新时，让 Digitaldepot 提醒你！";
    var customThemeSettingsColors$8 = "颜色";
    var customThemeSettingsConfig$8 = "自定义设置";
    var errorMessageTitle$8 = "哎呀！";
    var errorSubmitIssueNotValid$8 = "你的问题无效。请确保你遇到的问题不涉及任何插件或主题，若涉及，请与插件或主题的开发者联系。";
    var errorSubmitIssueNoDescription$8 = "请提供你所遇到的问题的描述（10字符以上）。";
    var errorSubmitIssueNoSteps$8 = "请提供如何复现你所遇到的问题的步骤（10字符以上）。";
    var errorSubmitIssueTooFrequent$8 = "哇哦，等会！你提交问题太快了。请在提交另一个问题之前稍等一会。";
    var updateSuccessful$8 = "已成功更新 {0}！";
    var updateSuccessfulRestart$8 = "已成功更新 {0}！由于你当前启用了该项目，更改将在重启 Steam 后生效。";
    var updateFailed$8 = "无法更新 {0}！请检查日志获取更多信息。";
    var messageTitleWarning$8 = "请稍等！";
    var messageUpdateDisableClarification$8 = "你是否想要完全禁用更新检查，或只是想要禁用更新通知？你可以随时在 Digitaldepot 设置中更改这些选项。";
    var DisableUpdates$8 = "禁用更新检查";
    var DisableOnlyNotifications$8 = "仅禁用通知";
    var message1162025SecurityUpdate$8 = "我们决定更新我们的安全政策，以更好地服务于您，乃至整个社区。截至 2025/3/27，我们决定采取强制措施明确询问您是否想要接收来自 Digitaldepot 的更新。";
    var message1162025SecurityUpdateTooltip$8 = "这仅仅是 Digitaldepot 本体的更新，不包含主题和插件更新，因为那些是单独处理的，且从来都不是自动更新的。";
    var updateSecurityWarning$8 = "我们强烈建议您启用这些选项，因为这能保证让你收到最新的安全修复更新。若 Digitaldepot 无法正常进行更新可能导致遇到安全漏洞，功能损坏，或其他问题。";
    var settingsAreChangeableLater$8 = "你可以随时在 Digitaldepot 设置中更改这些选项。";
    var strViewUpdateDiffInBrowser$8 = "在浏览器中查看差异";
    var strViewDownloadInfo$8 = "查看下载信息";
    var strUpdateNextStartup$8 = "下次启动时更新";
    var strUpdateReject$8 = "以后再说";
    var strDontShowAgain$8 = "不再显示";
    var strAnUpdateIsAvailable$8 = "Digitaldepot 有更新可用！我们向你展示该信息是因为你选择了接收更新。如果你不想接收这些信息，你可以开启自动更新，或者在 Digitaldepot 设置中完全禁用更新。";
    var updatePanelCheckForUpdates$8 = "检查更新";
    var updatePanelShowUpdateNotifications$8 = "显示更新通知";
    var HoldOn$8 = "请稍候！";
    var updateFailedPluginRunning$8 = "Digitaldepot 无法在 \"{0}\" 运行时更新，您需要先禁用它。";
    var themeAndPluginUpdateNotification$8 = "Digitaldepot 找到了 {0} 个可用的 {1}";
    var updateSingular$8 = "更新";
    var updatePlural$8 = "更新";
    var updatePanelErrorHeader$8 = "检查更新时发生错误！";
    var updatePanelErrorBody$8 = "请检查您的网络连接，然后重试。 ";
    var updatePanelErrorButton$8 = "重试";
    var errorFailedConnection$8 = "无法连接到 Digitaldepot！";
    var errorFailedConnectionBody$8 = "该问题并非网络相关，您可能缺少 Digitaldepot 需要的文件，或遇到了意外的错误。";
    var errorFailedConnectionButton$8 = "打开日志文件夹";
    var strDone$8 = "完成";
    var strUnknown$8 = "未知";
    var strInstallPlugin$8 = "安装 {0}";
    var strSuccessfulInstall$8 = "成功安装 {0}！";
    var strInstallComplete$8 = "安装完成";
    var strInstallProgress$8 = "安装进度";
    var strEnablePlugin$8 = "启用插件 (需要重新加载)";
    var strUseThemeRequiresReload$8 = "使用主题 (需要重新加载)";
    var strInvalidPluginBuildMessage$8 = "该插件没有适用于您的操作系统的有效构建。";
    var strInvalidPluginBuild$8 = "无效构建";
    var strAlreadyInPluginLibrary$8 = "{0} 已经在您的插件库中！";
    var strAlreadyInstalled$8 = "已安装";
    var errorFailedToDownloadPlugin$8 = "下载插件失败：{0}";
    var errorFailedToStartThemeInstaller$8 = "无法启动内部安装模块...";
    var warningConflictingFiles$8 = "文件冲突";
    var warningThemeAlreadyInstalled$8 = "您已经安装了该主题！要重新安装吗？如果您添加了自定义文件，它们将会丢失。";
    var errorFailedToUninstallTheme$8 = "卸载主题失败：{0}";
    var strNeverMind$8 = "没关系";
    var strReinstall$8 = "重新安装";
    var errorFailedToFetchTheme$8 = "获取主题信息失败：";
    var errorFailedToFetchPlugin$8 = "获取插件信息失败：";
    var errorInvalidID$8 = "ID 为空或无效";
    var warnProceedInstallation$8 = "确定要继续安装吗？";
    var strByAuthor$8 = "作者 {0}";
    var strUpdatingTheme$8 = "正在更新主题...";
    var strFinishedUpdating$8 = "更新完成！";
    var strPreparing$8 = "准备中...";
    var strUpdatingPlugin$8 = "正在更新插件...";
    var strComplete$8 = "完成！";
    var optionCheckForThemeAndPluginUpdates$8 = "检查主题和插件更新";
    var optionWhenAPluginOrThemeUpdateIsAvailable$8 = "当插件或主题有更新时";
    var headerOnStartup$8 = "启动时";
    var headerUpdates$8 = "更新";
    var headerNotifications$8 = "通知";
    var headerThemes$8 = "主题";
    var optionInstallPlugin$8 = "安装插件";
    var optionInstallTheme$8 = "安装主题";
    var optionBrowseLocalFiles$8 = "浏览本地文件";
    var strWelcomeModalTitle$8 = "欢迎使用 Digitaldepot 👋";
    var strWelcomeModalDescription$8 = "您的 Steam 现已与 DigitalDepot 集成！\n\n由于这是您第一次运行 DigitalDepot 应用程序，让我们现在就开始您与我们的旅程！\n\n如果您需要帮助，可以直接在 [Digitaldepot](https://digitaldepot.id/) 实时聊天 💬\n\n享受您与 DigitalDepot 的全新体验 🚀";
    var strWelcomeModalOKButton$8 = "好的";
    var strAbout$8 = "关于";
    var strAboutVersion$8 = "Digitaldepot 版本";
    var strAboutBuildDate$8 = "Digitaldepot 构建日期";
    var eOnMillenniumUpdateDoNothing$8 = "不执行任何操作";
    var eOnMillenniumUpdateNotify$8 = "通知我";
    var eOnMillenniumUpdateAutoInstall$8 = "自动安装";
    var optionCheckForMillenniumUpdates$8 = "检查 Digitaldepot 更新";
    var optionWhenAnUpdateForMillenniumIsAvailable$8 = "当 Digitaldepot 有更新时";
    var strMillenniumUpdate$8 = "Digitaldepot 更新";
    var toggleWantsMillenniumUpdates$8 = "您希望 Digitaldepot 检查更新吗？";
    var toggleWantsMillenniumUpdatesTooltip$8 = "如果启用，Digitaldepot 会自动检查更新。除非您禁用通知（下方设置），否则更新不会自动应用。您会收到一个弹出框，可以选择更新或关闭。";
    var toggleWantsMillenniumUpdatesNotifications$8 = "您希望在发现更新时收到通知吗？（类似于此弹出窗口）";
    var toggleWantsMillenniumUpdatesNotificationsTooltip$8 = "如果启用检查更新，发现更新且此设置已启用，您会收到一个弹出框，可以选择更新或保持当前版本。如果启用检查更新，发现更新但此设置未启用，您不会收到弹出框，更新会自动应用。";
    var tooltipCheckForMillenniumUpdates$8 = "已禁用检查更新，此设置不会生效。";
    var millenniumUpdateSuccessTitle$8 = "已成功更新！";
    var millenniumUpdateSuccessMessage$8 = "已成功将 Digitaldepot 更新至 {0}。更新将在重启后生效。";
    var schinese = {
    	settingsPanelPlugins: settingsPanelPlugins$8,
    	settingsPanelThemes: settingsPanelThemes$8,
    	settingsPanelGeneral: settingsPanelGeneral$8,
    	settingsPanelUpdates: settingsPanelUpdates$8,
    	settingsPanelLogs: settingsPanelLogs$8,
    	settingsPanelSettings: settingsPanelSettings$8,
    	settingsPanelAbout: settingsPanelAbout$8,
    	settingsPanelBugReport: settingsPanelBugReport$8,
    	itemNoDescription: itemNoDescription$8,
    	themePanelClientTheme: themePanelClientTheme$8,
    	themePanelThemeTooltip: themePanelThemeTooltip$8,
    	pluginPanelPluginTooltip: pluginPanelPluginTooltip$8,
    	themePanelGetMoreThemes: themePanelGetMoreThemes$8,
    	pluginPanelGetMorePlugins: pluginPanelGetMorePlugins$8,
    	themePanelInjectJavascript: themePanelInjectJavascript$8,
    	themePanelInjectJavascriptToolTip: themePanelInjectJavascriptToolTip$8,
    	themePanelInjectCSS: themePanelInjectCSS$8,
    	themePanelInjectCSSToolTip: themePanelInjectCSSToolTip$8,
    	themePanelCustomAccentColor: themePanelCustomAccentColor$8,
    	themePanelCustomAccentColorToolTip: themePanelCustomAccentColorToolTip$8,
    	themePanelCustomColorNotUsed: themePanelCustomColorNotUsed$8,
    	themePanelCustomColorUsed: themePanelCustomColorUsed$8,
    	updatePanelHasUpdates: updatePanelHasUpdates$8,
    	updatePanelHasUpdatesSub: updatePanelHasUpdatesSub$8,
    	updatePanelReleasedTag: updatePanelReleasedTag$8,
    	updatePanelReleasePatchNotes: updatePanelReleasePatchNotes$8,
    	updatePanelIsUpdating: updatePanelIsUpdating$8,
    	updatePanelUpdate: updatePanelUpdate$8,
    	updatePanelNoUpdatesFoundHeader: updatePanelNoUpdatesFoundHeader$8,
    	updatePanelNoUpdatesFound: updatePanelNoUpdatesFound$8,
    	ViewMore: ViewMore$8,
    	aboutThemeAnonymous: aboutThemeAnonymous$8,
    	aboutThemeTitle: aboutThemeTitle$8,
    	aboutThemeVerifiedDev: aboutThemeVerifiedDev$8,
    	viewSourceCode: viewSourceCode$8,
    	showInFolder: showInFolder$8,
    	uninstall: uninstall$8,
    	optionSaveChanges: optionSaveChanges$8,
    	optionReloadNow: optionReloadNow$8,
    	optionReloadLater: optionReloadLater$8,
    	optionReloadRequired: optionReloadRequired$8,
    	optionPluginNeedsReload: optionPluginNeedsReload$8,
    	updatePanelUpdateNotifications: updatePanelUpdateNotifications$8,
    	updatePanelUpdateNotificationsTooltip: updatePanelUpdateNotificationsTooltip$8,
    	customThemeSettingsColors: customThemeSettingsColors$8,
    	customThemeSettingsConfig: customThemeSettingsConfig$8,
    	errorMessageTitle: errorMessageTitle$8,
    	errorSubmitIssueNotValid: errorSubmitIssueNotValid$8,
    	errorSubmitIssueNoDescription: errorSubmitIssueNoDescription$8,
    	errorSubmitIssueNoSteps: errorSubmitIssueNoSteps$8,
    	errorSubmitIssueTooFrequent: errorSubmitIssueTooFrequent$8,
    	updateSuccessful: updateSuccessful$8,
    	updateSuccessfulRestart: updateSuccessfulRestart$8,
    	updateFailed: updateFailed$8,
    	messageTitleWarning: messageTitleWarning$8,
    	messageUpdateDisableClarification: messageUpdateDisableClarification$8,
    	DisableUpdates: DisableUpdates$8,
    	DisableOnlyNotifications: DisableOnlyNotifications$8,
    	message1162025SecurityUpdate: message1162025SecurityUpdate$8,
    	message1162025SecurityUpdateTooltip: message1162025SecurityUpdateTooltip$8,
    	updateSecurityWarning: updateSecurityWarning$8,
    	settingsAreChangeableLater: settingsAreChangeableLater$8,
    	strViewUpdateDiffInBrowser: strViewUpdateDiffInBrowser$8,
    	strViewDownloadInfo: strViewDownloadInfo$8,
    	strUpdateNextStartup: strUpdateNextStartup$8,
    	strUpdateReject: strUpdateReject$8,
    	strDontShowAgain: strDontShowAgain$8,
    	strAnUpdateIsAvailable: strAnUpdateIsAvailable$8,
    	updatePanelCheckForUpdates: updatePanelCheckForUpdates$8,
    	updatePanelShowUpdateNotifications: updatePanelShowUpdateNotifications$8,
    	HoldOn: HoldOn$8,
    	updateFailedPluginRunning: updateFailedPluginRunning$8,
    	themeAndPluginUpdateNotification: themeAndPluginUpdateNotification$8,
    	updateSingular: updateSingular$8,
    	updatePlural: updatePlural$8,
    	updatePanelErrorHeader: updatePanelErrorHeader$8,
    	updatePanelErrorBody: updatePanelErrorBody$8,
    	updatePanelErrorButton: updatePanelErrorButton$8,
    	errorFailedConnection: errorFailedConnection$8,
    	errorFailedConnectionBody: errorFailedConnectionBody$8,
    	errorFailedConnectionButton: errorFailedConnectionButton$8,
    	strDone: strDone$8,
    	strUnknown: strUnknown$8,
    	strInstallPlugin: strInstallPlugin$8,
    	strSuccessfulInstall: strSuccessfulInstall$8,
    	strInstallComplete: strInstallComplete$8,
    	strInstallProgress: strInstallProgress$8,
    	strEnablePlugin: strEnablePlugin$8,
    	strUseThemeRequiresReload: strUseThemeRequiresReload$8,
    	strInvalidPluginBuildMessage: strInvalidPluginBuildMessage$8,
    	strInvalidPluginBuild: strInvalidPluginBuild$8,
    	strAlreadyInPluginLibrary: strAlreadyInPluginLibrary$8,
    	strAlreadyInstalled: strAlreadyInstalled$8,
    	errorFailedToDownloadPlugin: errorFailedToDownloadPlugin$8,
    	errorFailedToStartThemeInstaller: errorFailedToStartThemeInstaller$8,
    	warningConflictingFiles: warningConflictingFiles$8,
    	warningThemeAlreadyInstalled: warningThemeAlreadyInstalled$8,
    	errorFailedToUninstallTheme: errorFailedToUninstallTheme$8,
    	strNeverMind: strNeverMind$8,
    	strReinstall: strReinstall$8,
    	errorFailedToFetchTheme: errorFailedToFetchTheme$8,
    	errorFailedToFetchPlugin: errorFailedToFetchPlugin$8,
    	errorInvalidID: errorInvalidID$8,
    	warnProceedInstallation: warnProceedInstallation$8,
    	strByAuthor: strByAuthor$8,
    	strUpdatingTheme: strUpdatingTheme$8,
    	strFinishedUpdating: strFinishedUpdating$8,
    	strPreparing: strPreparing$8,
    	strUpdatingPlugin: strUpdatingPlugin$8,
    	strComplete: strComplete$8,
    	optionCheckForThemeAndPluginUpdates: optionCheckForThemeAndPluginUpdates$8,
    	optionWhenAPluginOrThemeUpdateIsAvailable: optionWhenAPluginOrThemeUpdateIsAvailable$8,
    	headerOnStartup: headerOnStartup$8,
    	headerUpdates: headerUpdates$8,
    	headerNotifications: headerNotifications$8,
    	headerThemes: headerThemes$8,
    	optionInstallPlugin: optionInstallPlugin$8,
    	optionInstallTheme: optionInstallTheme$8,
    	optionBrowseLocalFiles: optionBrowseLocalFiles$8,
    	strWelcomeModalTitle: strWelcomeModalTitle$8,
    	strWelcomeModalDescription: strWelcomeModalDescription$8,
    	strWelcomeModalOKButton: strWelcomeModalOKButton$8,
    	strAbout: strAbout$8,
    	strAboutVersion: strAboutVersion$8,
    	strAboutBuildDate: strAboutBuildDate$8,
    	eOnMillenniumUpdateDoNothing: eOnMillenniumUpdateDoNothing$8,
    	eOnMillenniumUpdateNotify: eOnMillenniumUpdateNotify$8,
    	eOnMillenniumUpdateAutoInstall: eOnMillenniumUpdateAutoInstall$8,
    	optionCheckForMillenniumUpdates: optionCheckForMillenniumUpdates$8,
    	optionWhenAnUpdateForMillenniumIsAvailable: optionWhenAnUpdateForMillenniumIsAvailable$8,
    	strMillenniumUpdate: strMillenniumUpdate$8,
    	toggleWantsMillenniumUpdates: toggleWantsMillenniumUpdates$8,
    	toggleWantsMillenniumUpdatesTooltip: toggleWantsMillenniumUpdatesTooltip$8,
    	toggleWantsMillenniumUpdatesNotifications: toggleWantsMillenniumUpdatesNotifications$8,
    	toggleWantsMillenniumUpdatesNotificationsTooltip: toggleWantsMillenniumUpdatesNotificationsTooltip$8,
    	tooltipCheckForMillenniumUpdates: tooltipCheckForMillenniumUpdates$8,
    	millenniumUpdateSuccessTitle: millenniumUpdateSuccessTitle$8,
    	millenniumUpdateSuccessMessage: millenniumUpdateSuccessMessage$8
    };

    var settingsPanelPlugins$7 = "Plugins";
    var settingsPanelThemes$7 = "Designs";
    var settingsPanelUpdates$7 = "Updates";
    var settingsPanelLogs$7 = "Protokolle";
    var settingsPanelSettings$7 = "Einstellungen";
    var settingsPanelAbout$7 = "Über";
    var settingsPanelBugReport$7 = "Einen Fehler melden";
    var itemNoDescription$7 = "Noch keine Beschreibung.";
    var themePanelClientTheme$7 = "App Design";
    var themePanelThemeTooltip$7 = "Wählen Sie das Design, das Steam verwenden soll (erfordert Neuladen)";
    var pluginPanelPluginTooltip$7 = "Sie haben noch keine Plugins installiert? ";
    var themePanelGetMoreThemes$7 = "Weitere Designs erhalten";
    var pluginPanelGetMorePlugins$7 = "Finde Plugins hier";
    var themePanelInjectJavascript$7 = "Injiziere JavaScript";
    var themePanelInjectJavascriptToolTip$7 = "Legen Sie fest, ob Designs JavaScript in Steam injizieren dürfen. Das Deaktivieren von JavaScript kann als Nebenprodukt die Steam-Oberfläche beschädigen (erfordert Neuladen)";
    var themePanelInjectCSS$7 = "Injiziere StyleSheets";
    var themePanelInjectCSSToolTip$7 = "Entscheiden Sie, ob Designs Stylesheets in Steam injizieren dürfen. (erfordert Neuladen)";
    var themePanelCustomAccentColor$7 = "Benutzerdefinierte Akzentfarbe";
    var themePanelCustomAccentColorToolTip$7 = "Einstellen einer benutzerdefinierten Akzentfarbe für Designs, die dies unterstützen (erfordert Neuladen)";
    var themePanelCustomColorNotUsed$7 = "Hinweis: Das aktive Design verwendet diese Einstellung NICHT.";
    var themePanelCustomColorUsed$7 = "Hinweis: Das aktive Design verwendet diese Einstellung!";
    var updatePanelHasUpdates$7 = "Aktualisierungen verfügbar!";
    var updatePanelHasUpdatesSub$7 = "Digitaldepot hat die folgenden Aktualisierungen für Ihre Designs gefunden.";
    var updatePanelReleasedTag$7 = "Veröffentlicht:";
    var updatePanelReleasePatchNotes$7 = "Patch Notes:";
    var updatePanelIsUpdating$7 = "Aktualisierung im Gange...";
    var updatePanelUpdate$7 = "Aktualisierung";
    var updatePanelNoUpdatesFound$7 = "Keine Aktualisierungen gefunden. Sie sind startklar!";
    var ViewMore$7 = "Mehr Ansehen";
    var aboutThemeAnonymous$7 = "Anonym";
    var aboutThemeTitle$7 = "Über";
    var aboutThemeVerifiedDev$7 = "Verifizierter Entwickler";
    var viewSourceCode$7 = "Quellcode anzeigen";
    var showInFolder$7 = "In Ordner anzeigen";
    var uninstall$7 = "Deinstallieren";
    var optionSaveChanges$7 = "Änderungen speichern";
    var optionReloadNow$7 = "Jetzt neu laden";
    var optionReloadLater$7 = "Später neu laden";
    var optionReloadRequired$7 = "Neuladen benötigt";
    var optionPluginNeedsReload$7 = "Um dieses Plugin zu aktivieren oder zu deaktivieren, ist ein Neustart erforderlich. Sind Sie sicher, dass Sie fortfahren möchten?";
    var updatePanelUpdateNotifications$7 = "Push-Benachrichtigungen";
    var updatePanelUpdateNotificationsTooltip$7 = "Lassen Sie sich von Digitaldepot daran erinnern, wenn ein Objekt in Ihrer Bibliothek aktualisiert wurde!";
    var customThemeSettingsColors$7 = "Farben";
    var customThemeSettingsConfig$7 = "Benutzerdefinierte Einstellungen";
    var errorMessageTitle$7 = "Ups!";
    var errorSubmitIssueNotValid$7 = "Ihr Problem ist nicht gültig. Vergewissern Sie sich, dass Ihr Problem nicht mit einem Plugin oder Design zusammenhängt. Wenn doch, wenden Sie sich bitte an den Entwickler des Plugins oder Designs.";
    var errorSubmitIssueNoDescription$7 = "Bitte geben Sie eine Beschreibung Ihres Problems an (10 Zeichen oder mehr).";
    var errorSubmitIssueNoSteps$7 = "Bitte geben Sie einen Überblick, wie man Ihr Problem reproduzieren kann (10 Zeichen oder mehr).";
    var errorSubmitIssueTooFrequent$7 = "Whoa! Sie reichen die Probleme zu schnell ein. Bitte warten Sie ein wenig, bevor Sie ein weiteres Problem einreichen.";
    var updateSuccessful$7 = "Erfolgreich aktualisiert {0}";
    var updateSuccessfulRestart$7 = "Erfolgreich aktualisiert {0}! Da du es derzeit aktiv hast, musst du Steam neu starten, damit die Änderungen wirksam werden.";
    var updateFailed$7 = "Aktualisierung von {0} fehlgeschlagen! Prüfen Sie die Protokolle für weitere Informationen.";
    var messageTitleWarning$7 = "Eine Sekunde!";
    var messageUpdateDisableClarification$7 = "Möchten Sie die Aktualisierungsüberprüfungen ganz deaktivieren oder nur die Aktualisierungsbenachrichtigungen ausschalten? Sie können dies später in den Digitaldepot-Einstellungen jederzeit ändern.";
    var DisableUpdates$7 = "Aktualisierungen deaktivieren";
    var DisableOnlyNotifications$7 = "Nur Benachrichtigungen";
    var message1162025SecurityUpdate$7 = "Wir haben uns entschlossen, unsere Sicherheitsprotokolle zu aktualisieren, um Sie und die Gemeinschaft als Ganzes besser zu schützen. Ab dem 16.01.2025 werden wir Maßnahmen ergreifen, um Sie ausdrücklich zu fragen, ob Sie Updates von Digitaldepot erhalten möchten.";
    var message1162025SecurityUpdateTooltip$7 = "(Dies gilt NICHT für Design- und Plugin-Updates, die separat gehandhabt werden und nie automatisch waren)";
    var updateSecurityWarning$7 = "Es wird dringend empfohlen, diese Einstellungen aktiviert zu lassen, da so sichergestellt wird, dass Sie immer auf dem neuesten Stand der Sicherheitskorrekturen sind. Wenn Sie Digitaldepot nicht auf dem neuesten Stand halten, kann dies zu Sicherheitslücken, fehlerhaften Funktionen oder anderen Problemen führen.";
    var settingsAreChangeableLater$7 = "Sie können diese Einstellungen später in den Digitaldepot-Einstellungen ändern.";
    var strViewUpdateDiffInBrowser$7 = "Diff im Browser anzeigen";
    var strViewDownloadInfo$7 = "Informationen zum Download anzeigen";
    var strUpdateNextStartup$7 = "Update beim nächsten Start";
    var strUpdateReject$7 = "Ich verzichte";
    var strDontShowAgain$7 = "Nicht mehr anzeigen";
    var strAnUpdateIsAvailable$7 = "Eine Aktualisierung für Digitaldepot ist verfügbar! Wir zeigen Ihnen diese Nachricht an, weil Sie sich für den Erhalt von Updates entschieden haben. Wenn Sie diese Meldungen nicht mehr erhalten möchten, können Sie die automatischen Aktualisierungen aktivieren oder die Aktualisierungen in den Digitaldepot-Einstellungen vollständig deaktivieren.";
    var updatePanelCheckForUpdates$7 = "Nach Aktualisierungen suchen";
    var updatePanelShowUpdateNotifications$7 = "Update-Benachrichtigungen anzeigen";
    var strWelcomeModalTitle$7 = "Willkommen bei Digitaldepot 👋";
    var strWelcomeModalDescription$7 = "Ihr Steam ist jetzt mit DigitalDepot integriert!\n\nDa Sie die DigitalDepot-Anwendung zum ersten Mal ausführen, lassen Sie uns Ihre Reise mit uns jetzt beginnen!\n\nWenn Sie Hilfe benötigen, können Sie direkt bei [Digitaldepot](https://digitaldepot.id/) live chatten 💬\n\nGenießen Sie Ihre neue Erfahrung mit DigitalDepot 🚀";
    var strWelcomeModalOKButton$7 = "Verstanden!";
    var settingsPanelGeneral$7 = "Allgemein";
    var eOnMillenniumUpdateDoNothing$7 = "Nichts tun";
    var eOnMillenniumUpdateNotify$7 = "Benachrichtigen";
    var eOnMillenniumUpdateAutoInstall$7 = "Automatisch installieren";
    var errorFailedConnection$7 = "Verbindung zu Digitaldepot fehlgeschlagen!";
    var errorFailedConnectionBody$7 = "Dieses Problem ist nicht netzwerkbezogen, Ihnen fehlt höchstwahrscheinlich eine Datei, die Digitaldepot benötigt, oder Sie haben einen unerwarteten Fehler.";
    var errorFailedConnectionButton$7 = "Protokollordner öffnen";
    var errorFailedToDownloadPlugin$7 = "Plugin konnte nicht heruntergeladen werden: {0}";
    var errorFailedToFetchPlugin$7 = "Plugin-Info konnte nicht abgerufen werden: ";
    var errorFailedToFetchTheme$7 = "Design-Info konnte nicht abgerufen werden: ";
    var errorFailedToStartThemeInstaller$7 = "Internes Installationsmodul konnte nicht gestartet werden...";
    var errorFailedToUninstallTheme$7 = "Design konnte nicht deinstalliert werden: {0}";
    var errorInvalidID$7 = "ID ist leer oder ungültig";
    var headerNotifications$7 = "Benachrichtigungen";
    var headerOnStartup$7 = "Beim Start";
    var headerThemes$7 = "Designs";
    var headerUpdates$7 = "Aktualisierungen";
    var HoldOn$7 = "Moment mal!";
    var millenniumUpdateSuccessMessage$7 = "Digitaldepot wurde erfolgreich auf {0} aktualisiert. Die Änderungen werden nach einem Neustart wirksam.";
    var millenniumUpdateSuccessTitle$7 = "Erfolgreich aktualisiert!";
    var optionBrowseLocalFiles$7 = "Lokale Dateien durchsuchen";
    var optionCheckForMillenniumUpdates$7 = "Nach Digitaldepot-Updates suchen";
    var optionCheckForThemeAndPluginUpdates$7 = "Nach Design- und Plugin-Updates suchen";
    var optionInstallPlugin$7 = "Ein Plugin installieren";
    var optionInstallTheme$7 = "Ein Design installieren";
    var optionWhenAnUpdateForMillenniumIsAvailable$7 = "Wenn ein Update für Digitaldepot verfügbar ist";
    var optionWhenAPluginOrThemeUpdateIsAvailable$7 = "Wenn ein Plugin- oder Design-Update verfügbar ist";
    var strAbout$7 = "Über";
    var strAboutBuildDate$7 = "Digitaldepot Build-Datum";
    var strAboutVersion$7 = "Digitaldepot-Version";
    var strAlreadyInPluginLibrary$7 = "{0} ist bereits in Ihrer Plugin-Bibliothek!";
    var strAlreadyInstalled$7 = "Bereits installiert";
    var strByAuthor$7 = "Von {0}";
    var strComplete$7 = "Abgeschlossen!";
    var strDone$7 = "Fertig";
    var strEnablePlugin$7 = "Plugin aktivieren (Neuladen erforderlich)";
    var strFinishedUpdating$7 = "Aktualisierung abgeschlossen!";
    var strInstallComplete$7 = "Installation abgeschlossen";
    var strInstallPlugin$7 = "{0} installieren";
    var strInstallProgress$7 = "Installationsfortschritt";
    var strInvalidPluginBuild$7 = "Ungültiger Build";
    var strInvalidPluginBuildMessage$7 = "Dieses Plugin hat keinen gültigen Build für Ihr Betriebssystem.";
    var strMillenniumUpdate$7 = "Digitaldepot-Aktualisierungen";
    var strNeverMind$7 = "Egal";
    var strPreparing$7 = "Vorbereitung...";
    var strReinstall$7 = "Neu installieren";
    var strSuccessfulInstall$7 = "{0} erfolgreich installiert!";
    var strUnknown$7 = "Unbekannt";
    var strUpdatingPlugin$7 = "Plugin wird aktualisiert...";
    var strUpdatingTheme$7 = "Design wird aktualisiert...";
    var strUseThemeRequiresReload$7 = "Design verwenden (Neustart erforderlich)";
    var themeAndPluginUpdateNotification$7 = "Digitaldepot hat {0} verfügbare {1} gefunden";
    var toggleWantsMillenniumUpdates$7 = "Möchten Sie, dass Digitaldepot nach Updates sucht?";
    var toggleWantsMillenniumUpdatesNotifications$7 = "Möchten Sie benachrichtigt werden, wenn Aktualisierungen gefunden werden? (ähnlich wie dieses Popup)";
    var toggleWantsMillenniumUpdatesNotificationsTooltip$7 = "Wenn ein Update gefunden wird und diese Einstellung aktiviert ist, erhalten Sie ein Popup-Fenster mit der Option, zu aktualisieren oder auf der bereits installierten Version zu bleiben. Wenn ein Update gefunden wird und Sie diese Einstellung NICHT aktiviert haben, erhalten Sie kein Popup-Fenster, und das Update wird angewendet.";
    var toggleWantsMillenniumUpdatesTooltip$7 = "Wenn diese Option aktiviert ist, sucht Digitaldepot automatisch nach Aktualisierungen. Aktualisierungen werden NICHT automatisch durchgeführt, es sei denn, Sie haben die Benachrichtigungen deaktiviert (siehe Einstellung unten). Sie erhalten ein Popup-Fenster mit der Möglichkeit, zu aktualisieren oder dieses zu verwerfen.";
    var tooltipCheckForMillenniumUpdates$7 = "Die Suche nach Updates ist deaktiviert, diese Einstellung hat keine Auswirkung.";
    var updateFailedPluginRunning$7 = "Digitaldepot kann \"{0}\" nicht aktualisieren, während es läuft. Sie müssen es zuerst deaktivieren.";
    var updatePanelErrorBody$7 = "Bitte überprüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.";
    var updatePanelErrorButton$7 = "Erneut versuchen";
    var updatePanelErrorHeader$7 = "Beim Prüfen auf Aktualisierungen ist ein Fehler aufgetreten!";
    var updatePanelNoUpdatesFoundHeader$7 = "Keine Aktualisierungen";
    var updatePlural$7 = "Aktualisierungen";
    var updateSingular$7 = "Aktualisierung";
    var warningConflictingFiles$7 = "Konfliktdateien";
    var warningThemeAlreadyInstalled$7 = "Sie haben dieses Design bereits installiert! Möchten Sie es neu installieren? Wenn Sie eigene Dateien hinzugefügt haben, gehen deren Daten verloren.";
    var warnProceedInstallation$7 = "Sind Sie sicher, dass Sie mit der Installation fortfahren möchten?";
    var german = {
    	settingsPanelPlugins: settingsPanelPlugins$7,
    	settingsPanelThemes: settingsPanelThemes$7,
    	settingsPanelUpdates: settingsPanelUpdates$7,
    	settingsPanelLogs: settingsPanelLogs$7,
    	settingsPanelSettings: settingsPanelSettings$7,
    	settingsPanelAbout: settingsPanelAbout$7,
    	settingsPanelBugReport: settingsPanelBugReport$7,
    	itemNoDescription: itemNoDescription$7,
    	themePanelClientTheme: themePanelClientTheme$7,
    	themePanelThemeTooltip: themePanelThemeTooltip$7,
    	pluginPanelPluginTooltip: pluginPanelPluginTooltip$7,
    	themePanelGetMoreThemes: themePanelGetMoreThemes$7,
    	pluginPanelGetMorePlugins: pluginPanelGetMorePlugins$7,
    	themePanelInjectJavascript: themePanelInjectJavascript$7,
    	themePanelInjectJavascriptToolTip: themePanelInjectJavascriptToolTip$7,
    	themePanelInjectCSS: themePanelInjectCSS$7,
    	themePanelInjectCSSToolTip: themePanelInjectCSSToolTip$7,
    	themePanelCustomAccentColor: themePanelCustomAccentColor$7,
    	themePanelCustomAccentColorToolTip: themePanelCustomAccentColorToolTip$7,
    	themePanelCustomColorNotUsed: themePanelCustomColorNotUsed$7,
    	themePanelCustomColorUsed: themePanelCustomColorUsed$7,
    	updatePanelHasUpdates: updatePanelHasUpdates$7,
    	updatePanelHasUpdatesSub: updatePanelHasUpdatesSub$7,
    	updatePanelReleasedTag: updatePanelReleasedTag$7,
    	updatePanelReleasePatchNotes: updatePanelReleasePatchNotes$7,
    	updatePanelIsUpdating: updatePanelIsUpdating$7,
    	updatePanelUpdate: updatePanelUpdate$7,
    	updatePanelNoUpdatesFound: updatePanelNoUpdatesFound$7,
    	ViewMore: ViewMore$7,
    	aboutThemeAnonymous: aboutThemeAnonymous$7,
    	aboutThemeTitle: aboutThemeTitle$7,
    	aboutThemeVerifiedDev: aboutThemeVerifiedDev$7,
    	viewSourceCode: viewSourceCode$7,
    	showInFolder: showInFolder$7,
    	uninstall: uninstall$7,
    	optionSaveChanges: optionSaveChanges$7,
    	optionReloadNow: optionReloadNow$7,
    	optionReloadLater: optionReloadLater$7,
    	optionReloadRequired: optionReloadRequired$7,
    	optionPluginNeedsReload: optionPluginNeedsReload$7,
    	updatePanelUpdateNotifications: updatePanelUpdateNotifications$7,
    	updatePanelUpdateNotificationsTooltip: updatePanelUpdateNotificationsTooltip$7,
    	customThemeSettingsColors: customThemeSettingsColors$7,
    	customThemeSettingsConfig: customThemeSettingsConfig$7,
    	errorMessageTitle: errorMessageTitle$7,
    	errorSubmitIssueNotValid: errorSubmitIssueNotValid$7,
    	errorSubmitIssueNoDescription: errorSubmitIssueNoDescription$7,
    	errorSubmitIssueNoSteps: errorSubmitIssueNoSteps$7,
    	errorSubmitIssueTooFrequent: errorSubmitIssueTooFrequent$7,
    	updateSuccessful: updateSuccessful$7,
    	updateSuccessfulRestart: updateSuccessfulRestart$7,
    	updateFailed: updateFailed$7,
    	messageTitleWarning: messageTitleWarning$7,
    	messageUpdateDisableClarification: messageUpdateDisableClarification$7,
    	DisableUpdates: DisableUpdates$7,
    	DisableOnlyNotifications: DisableOnlyNotifications$7,
    	message1162025SecurityUpdate: message1162025SecurityUpdate$7,
    	message1162025SecurityUpdateTooltip: message1162025SecurityUpdateTooltip$7,
    	updateSecurityWarning: updateSecurityWarning$7,
    	settingsAreChangeableLater: settingsAreChangeableLater$7,
    	strViewUpdateDiffInBrowser: strViewUpdateDiffInBrowser$7,
    	strViewDownloadInfo: strViewDownloadInfo$7,
    	strUpdateNextStartup: strUpdateNextStartup$7,
    	strUpdateReject: strUpdateReject$7,
    	strDontShowAgain: strDontShowAgain$7,
    	strAnUpdateIsAvailable: strAnUpdateIsAvailable$7,
    	updatePanelCheckForUpdates: updatePanelCheckForUpdates$7,
    	updatePanelShowUpdateNotifications: updatePanelShowUpdateNotifications$7,
    	strWelcomeModalTitle: strWelcomeModalTitle$7,
    	strWelcomeModalDescription: strWelcomeModalDescription$7,
    	strWelcomeModalOKButton: strWelcomeModalOKButton$7,
    	settingsPanelGeneral: settingsPanelGeneral$7,
    	eOnMillenniumUpdateDoNothing: eOnMillenniumUpdateDoNothing$7,
    	eOnMillenniumUpdateNotify: eOnMillenniumUpdateNotify$7,
    	eOnMillenniumUpdateAutoInstall: eOnMillenniumUpdateAutoInstall$7,
    	errorFailedConnection: errorFailedConnection$7,
    	errorFailedConnectionBody: errorFailedConnectionBody$7,
    	errorFailedConnectionButton: errorFailedConnectionButton$7,
    	errorFailedToDownloadPlugin: errorFailedToDownloadPlugin$7,
    	errorFailedToFetchPlugin: errorFailedToFetchPlugin$7,
    	errorFailedToFetchTheme: errorFailedToFetchTheme$7,
    	errorFailedToStartThemeInstaller: errorFailedToStartThemeInstaller$7,
    	errorFailedToUninstallTheme: errorFailedToUninstallTheme$7,
    	errorInvalidID: errorInvalidID$7,
    	headerNotifications: headerNotifications$7,
    	headerOnStartup: headerOnStartup$7,
    	headerThemes: headerThemes$7,
    	headerUpdates: headerUpdates$7,
    	HoldOn: HoldOn$7,
    	millenniumUpdateSuccessMessage: millenniumUpdateSuccessMessage$7,
    	millenniumUpdateSuccessTitle: millenniumUpdateSuccessTitle$7,
    	optionBrowseLocalFiles: optionBrowseLocalFiles$7,
    	optionCheckForMillenniumUpdates: optionCheckForMillenniumUpdates$7,
    	optionCheckForThemeAndPluginUpdates: optionCheckForThemeAndPluginUpdates$7,
    	optionInstallPlugin: optionInstallPlugin$7,
    	optionInstallTheme: optionInstallTheme$7,
    	optionWhenAnUpdateForMillenniumIsAvailable: optionWhenAnUpdateForMillenniumIsAvailable$7,
    	optionWhenAPluginOrThemeUpdateIsAvailable: optionWhenAPluginOrThemeUpdateIsAvailable$7,
    	strAbout: strAbout$7,
    	strAboutBuildDate: strAboutBuildDate$7,
    	strAboutVersion: strAboutVersion$7,
    	strAlreadyInPluginLibrary: strAlreadyInPluginLibrary$7,
    	strAlreadyInstalled: strAlreadyInstalled$7,
    	strByAuthor: strByAuthor$7,
    	strComplete: strComplete$7,
    	strDone: strDone$7,
    	strEnablePlugin: strEnablePlugin$7,
    	strFinishedUpdating: strFinishedUpdating$7,
    	strInstallComplete: strInstallComplete$7,
    	strInstallPlugin: strInstallPlugin$7,
    	strInstallProgress: strInstallProgress$7,
    	strInvalidPluginBuild: strInvalidPluginBuild$7,
    	strInvalidPluginBuildMessage: strInvalidPluginBuildMessage$7,
    	strMillenniumUpdate: strMillenniumUpdate$7,
    	strNeverMind: strNeverMind$7,
    	strPreparing: strPreparing$7,
    	strReinstall: strReinstall$7,
    	strSuccessfulInstall: strSuccessfulInstall$7,
    	strUnknown: strUnknown$7,
    	strUpdatingPlugin: strUpdatingPlugin$7,
    	strUpdatingTheme: strUpdatingTheme$7,
    	strUseThemeRequiresReload: strUseThemeRequiresReload$7,
    	themeAndPluginUpdateNotification: themeAndPluginUpdateNotification$7,
    	toggleWantsMillenniumUpdates: toggleWantsMillenniumUpdates$7,
    	toggleWantsMillenniumUpdatesNotifications: toggleWantsMillenniumUpdatesNotifications$7,
    	toggleWantsMillenniumUpdatesNotificationsTooltip: toggleWantsMillenniumUpdatesNotificationsTooltip$7,
    	toggleWantsMillenniumUpdatesTooltip: toggleWantsMillenniumUpdatesTooltip$7,
    	tooltipCheckForMillenniumUpdates: tooltipCheckForMillenniumUpdates$7,
    	updateFailedPluginRunning: updateFailedPluginRunning$7,
    	updatePanelErrorBody: updatePanelErrorBody$7,
    	updatePanelErrorButton: updatePanelErrorButton$7,
    	updatePanelErrorHeader: updatePanelErrorHeader$7,
    	updatePanelNoUpdatesFoundHeader: updatePanelNoUpdatesFoundHeader$7,
    	updatePlural: updatePlural$7,
    	updateSingular: updateSingular$7,
    	warningConflictingFiles: warningConflictingFiles$7,
    	warningThemeAlreadyInstalled: warningThemeAlreadyInstalled$7,
    	warnProceedInstallation: warnProceedInstallation$7
    };

    var settingsPanelPlugins$6 = "Плагины";
    var settingsPanelThemes$6 = "Темы";
    var settingsPanelGeneral$6 = "Общие";
    var settingsPanelUpdates$6 = "Обновления";
    var settingsPanelLogs$6 = "Логи";
    var settingsPanelSettings$6 = "Настройки";
    var settingsPanelAbout$6 = "О Digitaldepot";
    var settingsPanelBugReport$6 = "Сообщить об ошибке";
    var itemNoDescription$6 = "Без описания";
    var themePanelClientTheme$6 = "Тема клиента";
    var themePanelThemeTooltip$6 = "Выберите тему для Steam (требуется перезагрузка).";
    var pluginPanelPluginTooltip$6 = "У вас не установлено ни одного плагина. ";
    var themePanelGetMoreThemes$6 = "Скачать темы";
    var pluginPanelGetMorePlugins$6 = "Скачать плагины";
    var themePanelInjectJavascript$6 = "Разрешить использовать JavaScript";
    var themePanelInjectJavascriptToolTip$6 = "Определяет, могут ли темы использовать JavaScript в Steam. Отключение может нарушить работу интерфейса Steam (требуется перезагрузка).";
    var themePanelInjectCSS$6 = "Разрешить использовать CSS";
    var themePanelInjectCSSToolTip$6 = "Определяет, могут ли темы изменять стили Steam. Отключение может нарушить внешний вид Steam (требуется перезагрузка).";
    var themePanelCustomAccentColor$6 = "Переопределить акцентный цвет";
    var themePanelCustomAccentColorToolTip$6 = "Позволяет заменить системный акцентный цвет в Steam. Работает только с темами, которые его используют. Без эффекта, если тема не поддерживает эту функцию.";
    var themePanelCustomColorNotUsed$6 = "Примечание: текущая тема не использует эту настройку.";
    var themePanelCustomColorUsed$6 = "Примечание: текущая тема использует эту настройку!";
    var updatePanelHasUpdates$6 = "Доступны обновления!";
    var updatePanelHasUpdatesSub$6 = "Digitaldepot нашел следующие обновления!";
    var updatePanelReleasedTag$6 = "Выпущено:";
    var updatePanelReleasePatchNotes$6 = "Список изменений:";
    var updatePanelIsUpdating$6 = "Обновление...";
    var updatePanelUpdate$6 = "Обновить";
    var updatePanelNoUpdatesFoundHeader$6 = "Нет обновлений";
    var updatePanelNoUpdatesFound$6 = "Доступных обновлений нет. Всё актуально!";
    var ViewMore$6 = "Подробнее";
    var aboutThemeAnonymous$6 = "Аноним";
    var aboutThemeTitle$6 = "О теме";
    var aboutThemeVerifiedDev$6 = "Проверенный разработчик";
    var viewSourceCode$6 = "Исходный код";
    var showInFolder$6 = "Открыть папку";
    var uninstall$6 = "Удалить";
    var optionSaveChanges$6 = "Сохранить изменения";
    var optionReloadNow$6 = "Перезагрузить";
    var optionReloadLater$6 = "Не сейчас";
    var optionReloadRequired$6 = "Требуется перезагрузка";
    var optionPluginNeedsReload$6 = "Для включения/отключения плагинов требуется перезагрузка. Продолжить?";
    var updatePanelUpdateNotifications$6 = "Показывать всплывающие уведомления";
    var updatePanelUpdateNotificationsTooltip$6 = "Получайте уведомления от Digitaldepot, когда элемент в вашей библиотеке имеет обновление";
    var customThemeSettingsColors$6 = "Цвета";
    var customThemeSettingsConfig$6 = "Пользовательские настройки";
    var errorMessageTitle$6 = "Упс... Ошибочка!";
    var errorSubmitIssueNotValid$6 = "Ваша проблема недействительна. Убедитесь, что она не связана с плагином или темой. Если связана — обратитесь к их разработчику.";
    var errorSubmitIssueNoDescription$6 = "Опишите свою проблему (минимум 10 символов).";
    var errorSubmitIssueNoSteps$6 = "Опишите, как воспроизвести проблему (не менее 10 символов).";
    var errorSubmitIssueTooFrequent$6 = "Воу! Вы отправляете обращения слишком быстро. Пожалуйста, подождите немного перед отправкой следующего.";
    var updateSuccessful$6 = "{0} успешно обновлено";
    var updateSuccessfulRestart$6 = "{0} успешно обновлен! Так как он сейчас используется, потребуется перезапустить Steam для применения изменений.";
    var updateFailed$6 = "{0} не удалось обновить! Проверьте логи для получения дополнительной информации.";
    var messageTitleWarning$6 = "Секундочку!";
    var messageUpdateDisableClarification$6 = "Вы хотите полностью отключить проверку обновлений или только уведомления о них? Это можно изменить позже в настройках Digitaldepot.";
    var DisableUpdates$6 = "Отключить обновления";
    var DisableOnlyNotifications$6 = "Только уведомления";
    var message1162025SecurityUpdate$6 = "Мы обновляем протоколы безопасности для вашей пользы и всего сообщества. С 27.03.2025 вводится подтверждение запросов на обновления Digitaldepot.";
    var message1162025SecurityUpdateTooltip$6 = "Это касается только обновлений Digitaldepot, а не тем и плагинов — они обрабатываются отдельно и никогда не обновлялись автоматически.";
    var updateSecurityWarning$6 = "Настоятельно рекомендуется оставить эти настройки включёнными, чтобы всегда получать последние исправления безопасности. Отказ от обновлений Digitaldepot может привести к уязвимостям, неработающим функциям или другим проблемам.";
    var settingsAreChangeableLater$6 = "Вы можете изменить эти настройки позже в настройках Digitaldepot.";
    var strViewUpdateDiffInBrowser$6 = "Посмотреть изменения в браузере";
    var strViewDownloadInfo$6 = "Сведения о загрузке";
    var strUpdateNextStartup$6 = "Обновить при следующем запуске";
    var strUpdateReject$6 = "Пропустить";
    var strDontShowAgain$6 = "Больше не показывать";
    var strAnUpdateIsAvailable$6 = "Доступно обновление для Digitaldepot! Это сообщение показано потому что вы согласились получать уведомления об обновлениях. Если вы больше не хотите получать эти сообщения, вы можете включить автоматические обновления или полностью отключить их в настройках Digitaldepot.";
    var updatePanelCheckForUpdates$6 = "Проверить обновления";
    var updatePanelShowUpdateNotifications$6 = "Показывать уведомления об обновлениях";
    var HoldOn$6 = "Подождите!";
    var updateFailedPluginRunning$6 = "Digitaldepot не может обновить \"{0}\" пока он запущен, сначала отключите его.";
    var themeAndPluginUpdateNotification$6 = "Digitaldepot нашёл {0} {1}";
    var updateSingular$6 = "обновление";
    var updatePlural$6 = "обновлений";
    var updatePanelErrorHeader$6 = "Произошла ошибка при проверке обновлений!";
    var updatePanelErrorBody$6 = "Проверьте подключение к интернету и попробуйте ещё раз.";
    var updatePanelErrorButton$6 = "Повторить";
    var errorFailedConnection$6 = "Не удалось подключиться к Digitaldepot!";
    var errorFailedConnectionBody$6 = "Эта проблема не связана с сетью, скорее всего отсутствует необходимый файл или возникла непредвиденная ошибка.";
    var errorFailedConnectionButton$6 = "Открыть папку логов";
    var strDone$6 = "Готово";
    var strUnknown$6 = "Неизвестно";
    var strInstallPlugin$6 = "Установить {0}";
    var strSuccessfulInstall$6 = "Успешно установлено {0}!";
    var strInstallComplete$6 = "Установка завершена";
    var strInstallProgress$6 = "Прогресс установки";
    var strEnablePlugin$6 = "Включить плагин (требуется перезагрузка)";
    var strUseThemeRequiresReload$6 = "Использовать тему (требуется перезагрузка)";
    var strInvalidPluginBuildMessage$6 = "Этот плагин не имеет подходящей сборки для вашей системы.";
    var strInvalidPluginBuild$6 = "Неподходящая сборка";
    var strAlreadyInPluginLibrary$6 = "{0} уже есть в вашей библиотеке плагинов!";
    var strAlreadyInstalled$6 = "Уже установлено";
    var errorFailedToDownloadPlugin$6 = "Не удалось скачать плагин: {0}";
    var errorFailedToStartThemeInstaller$6 = "Не удалось запустить внутренний модуль установки...";
    var warningConflictingFiles$6 = "Конфликтующие файлы";
    var warningThemeAlreadyInstalled$6 = "Эта тема уже установлена! Хотите переустановить её? Если вы добавляли/изменяли какие-либо пользовательские файлы, их данные будут потеряны.";
    var errorFailedToUninstallTheme$6 = "Не удалось удалить тему: {0}";
    var strNeverMind$6 = "Не важно";
    var strReinstall$6 = "Переустановить";
    var errorFailedToFetchTheme$6 = "Не удалось получить информацию о теме: ";
    var errorFailedToFetchPlugin$6 = "Не удалось получить информацию о плагине: ";
    var errorInvalidID$6 = "ID пуст или недействителен";
    var warnProceedInstallation$6 = "Вы уверены, что хотите продолжить установку?";
    var strByAuthor$6 = "Автор: {0}";
    var strUpdatingTheme$6 = "Обновление темы...";
    var strFinishedUpdating$6 = "Обновление завершено!";
    var strPreparing$6 = "Подготовка...";
    var strUpdatingPlugin$6 = "Обновление плагина...";
    var strComplete$6 = "Завершено!";
    var optionCheckForThemeAndPluginUpdates$6 = "Проверять обновления тем и плагинов";
    var optionWhenAPluginOrThemeUpdateIsAvailable$6 = "Когда доступно обновление плагина или темы";
    var headerOnStartup$6 = "При запуске";
    var headerUpdates$6 = "Обновления";
    var headerNotifications$6 = "Уведомления";
    var headerThemes$6 = "Темы";
    var optionInstallPlugin$6 = "Установить плагин";
    var optionInstallTheme$6 = "Установить тему";
    var optionBrowseLocalFiles$6 = "Открыть папку с темами";
    var strWelcomeModalTitle$6 = "Добро пожаловать в Digitaldepot 👋";
    var strWelcomeModalDescription$6 = "Ваш Steam теперь интегрирован с DigitalDepot!\n\nПоскольку вы впервые запускаете приложение DigitalDepot, давайте начнем ваше путешествие с нами прямо сейчас!\n\nЕсли вам нужна помощь, вы можете общаться в прямом эфире на [Digitaldepot](https://digitaldepot.id/) 💬\n\nНаслаждайтесь новым опытом с DigitalDepot 🚀";
    var strWelcomeModalOKButton$6 = "Понятно!";
    var strAbout$6 = "О Digitaldepot";
    var strAboutVersion$6 = "Версия Digitaldepot";
    var strAboutBuildDate$6 = "Дата сборки Digitaldepot";
    var eOnMillenniumUpdateDoNothing$6 = "Ничего не делать";
    var eOnMillenniumUpdateNotify$6 = "Уведомить меня";
    var eOnMillenniumUpdateAutoInstall$6 = "Устанавливать автоматически";
    var optionCheckForMillenniumUpdates$6 = "Проверять обновления Digitaldepot";
    var optionWhenAnUpdateForMillenniumIsAvailable$6 = "Когда доступно обновление Digitaldepot";
    var strMillenniumUpdate$6 = "Обновления Digitaldepot";
    var toggleWantsMillenniumUpdates$6 = "Хотите, чтобы Digitaldepot проверял обновления?";
    var toggleWantsMillenniumUpdatesTooltip$6 = "Если включено, Digitaldepot будет автоматически проверять обновления. Обновления НЕ будут устанавливаться автоматически, если вы не отключите уведомления (настройка ниже). Вы получите всплывающее окно с возможностью обновления или отказа.";
    var toggleWantsMillenniumUpdatesNotifications$6 = "Хотите получать уведомления при обнаружении обновлений? (подобно этому всплывающему окну)";
    var toggleWantsMillenniumUpdatesNotificationsTooltip$6 = "Если проверка обновлений включена, обновление найдено и эта настройка включена, вы получите всплывающее окно с возможностью обновления или сохранения текущей версии. Если проверка обновлений включена, обновление найдено, а эта настройка НЕ включена, вы не получите всплывающее окно, и обновление будет применено автоматически.";
    var tooltipCheckForMillenniumUpdates$6 = "Проверка обновлений отключена, эта настройка не будет действовать.";
    var millenniumUpdateSuccessTitle$6 = "Успешно обновлено!";
    var millenniumUpdateSuccessMessage$6 = "Digitaldepot успешно обновлён до версии {0}. Изменения вступят в силу после перезапуска.";
    var russian = {
    	settingsPanelPlugins: settingsPanelPlugins$6,
    	settingsPanelThemes: settingsPanelThemes$6,
    	settingsPanelGeneral: settingsPanelGeneral$6,
    	settingsPanelUpdates: settingsPanelUpdates$6,
    	settingsPanelLogs: settingsPanelLogs$6,
    	settingsPanelSettings: settingsPanelSettings$6,
    	settingsPanelAbout: settingsPanelAbout$6,
    	settingsPanelBugReport: settingsPanelBugReport$6,
    	itemNoDescription: itemNoDescription$6,
    	themePanelClientTheme: themePanelClientTheme$6,
    	themePanelThemeTooltip: themePanelThemeTooltip$6,
    	pluginPanelPluginTooltip: pluginPanelPluginTooltip$6,
    	themePanelGetMoreThemes: themePanelGetMoreThemes$6,
    	pluginPanelGetMorePlugins: pluginPanelGetMorePlugins$6,
    	themePanelInjectJavascript: themePanelInjectJavascript$6,
    	themePanelInjectJavascriptToolTip: themePanelInjectJavascriptToolTip$6,
    	themePanelInjectCSS: themePanelInjectCSS$6,
    	themePanelInjectCSSToolTip: themePanelInjectCSSToolTip$6,
    	themePanelCustomAccentColor: themePanelCustomAccentColor$6,
    	themePanelCustomAccentColorToolTip: themePanelCustomAccentColorToolTip$6,
    	themePanelCustomColorNotUsed: themePanelCustomColorNotUsed$6,
    	themePanelCustomColorUsed: themePanelCustomColorUsed$6,
    	updatePanelHasUpdates: updatePanelHasUpdates$6,
    	updatePanelHasUpdatesSub: updatePanelHasUpdatesSub$6,
    	updatePanelReleasedTag: updatePanelReleasedTag$6,
    	updatePanelReleasePatchNotes: updatePanelReleasePatchNotes$6,
    	updatePanelIsUpdating: updatePanelIsUpdating$6,
    	updatePanelUpdate: updatePanelUpdate$6,
    	updatePanelNoUpdatesFoundHeader: updatePanelNoUpdatesFoundHeader$6,
    	updatePanelNoUpdatesFound: updatePanelNoUpdatesFound$6,
    	ViewMore: ViewMore$6,
    	aboutThemeAnonymous: aboutThemeAnonymous$6,
    	aboutThemeTitle: aboutThemeTitle$6,
    	aboutThemeVerifiedDev: aboutThemeVerifiedDev$6,
    	viewSourceCode: viewSourceCode$6,
    	showInFolder: showInFolder$6,
    	uninstall: uninstall$6,
    	optionSaveChanges: optionSaveChanges$6,
    	optionReloadNow: optionReloadNow$6,
    	optionReloadLater: optionReloadLater$6,
    	optionReloadRequired: optionReloadRequired$6,
    	optionPluginNeedsReload: optionPluginNeedsReload$6,
    	updatePanelUpdateNotifications: updatePanelUpdateNotifications$6,
    	updatePanelUpdateNotificationsTooltip: updatePanelUpdateNotificationsTooltip$6,
    	customThemeSettingsColors: customThemeSettingsColors$6,
    	customThemeSettingsConfig: customThemeSettingsConfig$6,
    	errorMessageTitle: errorMessageTitle$6,
    	errorSubmitIssueNotValid: errorSubmitIssueNotValid$6,
    	errorSubmitIssueNoDescription: errorSubmitIssueNoDescription$6,
    	errorSubmitIssueNoSteps: errorSubmitIssueNoSteps$6,
    	errorSubmitIssueTooFrequent: errorSubmitIssueTooFrequent$6,
    	updateSuccessful: updateSuccessful$6,
    	updateSuccessfulRestart: updateSuccessfulRestart$6,
    	updateFailed: updateFailed$6,
    	messageTitleWarning: messageTitleWarning$6,
    	messageUpdateDisableClarification: messageUpdateDisableClarification$6,
    	DisableUpdates: DisableUpdates$6,
    	DisableOnlyNotifications: DisableOnlyNotifications$6,
    	message1162025SecurityUpdate: message1162025SecurityUpdate$6,
    	message1162025SecurityUpdateTooltip: message1162025SecurityUpdateTooltip$6,
    	updateSecurityWarning: updateSecurityWarning$6,
    	settingsAreChangeableLater: settingsAreChangeableLater$6,
    	strViewUpdateDiffInBrowser: strViewUpdateDiffInBrowser$6,
    	strViewDownloadInfo: strViewDownloadInfo$6,
    	strUpdateNextStartup: strUpdateNextStartup$6,
    	strUpdateReject: strUpdateReject$6,
    	strDontShowAgain: strDontShowAgain$6,
    	strAnUpdateIsAvailable: strAnUpdateIsAvailable$6,
    	updatePanelCheckForUpdates: updatePanelCheckForUpdates$6,
    	updatePanelShowUpdateNotifications: updatePanelShowUpdateNotifications$6,
    	HoldOn: HoldOn$6,
    	updateFailedPluginRunning: updateFailedPluginRunning$6,
    	themeAndPluginUpdateNotification: themeAndPluginUpdateNotification$6,
    	updateSingular: updateSingular$6,
    	updatePlural: updatePlural$6,
    	updatePanelErrorHeader: updatePanelErrorHeader$6,
    	updatePanelErrorBody: updatePanelErrorBody$6,
    	updatePanelErrorButton: updatePanelErrorButton$6,
    	errorFailedConnection: errorFailedConnection$6,
    	errorFailedConnectionBody: errorFailedConnectionBody$6,
    	errorFailedConnectionButton: errorFailedConnectionButton$6,
    	strDone: strDone$6,
    	strUnknown: strUnknown$6,
    	strInstallPlugin: strInstallPlugin$6,
    	strSuccessfulInstall: strSuccessfulInstall$6,
    	strInstallComplete: strInstallComplete$6,
    	strInstallProgress: strInstallProgress$6,
    	strEnablePlugin: strEnablePlugin$6,
    	strUseThemeRequiresReload: strUseThemeRequiresReload$6,
    	strInvalidPluginBuildMessage: strInvalidPluginBuildMessage$6,
    	strInvalidPluginBuild: strInvalidPluginBuild$6,
    	strAlreadyInPluginLibrary: strAlreadyInPluginLibrary$6,
    	strAlreadyInstalled: strAlreadyInstalled$6,
    	errorFailedToDownloadPlugin: errorFailedToDownloadPlugin$6,
    	errorFailedToStartThemeInstaller: errorFailedToStartThemeInstaller$6,
    	warningConflictingFiles: warningConflictingFiles$6,
    	warningThemeAlreadyInstalled: warningThemeAlreadyInstalled$6,
    	errorFailedToUninstallTheme: errorFailedToUninstallTheme$6,
    	strNeverMind: strNeverMind$6,
    	strReinstall: strReinstall$6,
    	errorFailedToFetchTheme: errorFailedToFetchTheme$6,
    	errorFailedToFetchPlugin: errorFailedToFetchPlugin$6,
    	errorInvalidID: errorInvalidID$6,
    	warnProceedInstallation: warnProceedInstallation$6,
    	strByAuthor: strByAuthor$6,
    	strUpdatingTheme: strUpdatingTheme$6,
    	strFinishedUpdating: strFinishedUpdating$6,
    	strPreparing: strPreparing$6,
    	strUpdatingPlugin: strUpdatingPlugin$6,
    	strComplete: strComplete$6,
    	optionCheckForThemeAndPluginUpdates: optionCheckForThemeAndPluginUpdates$6,
    	optionWhenAPluginOrThemeUpdateIsAvailable: optionWhenAPluginOrThemeUpdateIsAvailable$6,
    	headerOnStartup: headerOnStartup$6,
    	headerUpdates: headerUpdates$6,
    	headerNotifications: headerNotifications$6,
    	headerThemes: headerThemes$6,
    	optionInstallPlugin: optionInstallPlugin$6,
    	optionInstallTheme: optionInstallTheme$6,
    	optionBrowseLocalFiles: optionBrowseLocalFiles$6,
    	strWelcomeModalTitle: strWelcomeModalTitle$6,
    	strWelcomeModalDescription: strWelcomeModalDescription$6,
    	strWelcomeModalOKButton: strWelcomeModalOKButton$6,
    	strAbout: strAbout$6,
    	strAboutVersion: strAboutVersion$6,
    	strAboutBuildDate: strAboutBuildDate$6,
    	eOnMillenniumUpdateDoNothing: eOnMillenniumUpdateDoNothing$6,
    	eOnMillenniumUpdateNotify: eOnMillenniumUpdateNotify$6,
    	eOnMillenniumUpdateAutoInstall: eOnMillenniumUpdateAutoInstall$6,
    	optionCheckForMillenniumUpdates: optionCheckForMillenniumUpdates$6,
    	optionWhenAnUpdateForMillenniumIsAvailable: optionWhenAnUpdateForMillenniumIsAvailable$6,
    	strMillenniumUpdate: strMillenniumUpdate$6,
    	toggleWantsMillenniumUpdates: toggleWantsMillenniumUpdates$6,
    	toggleWantsMillenniumUpdatesTooltip: toggleWantsMillenniumUpdatesTooltip$6,
    	toggleWantsMillenniumUpdatesNotifications: toggleWantsMillenniumUpdatesNotifications$6,
    	toggleWantsMillenniumUpdatesNotificationsTooltip: toggleWantsMillenniumUpdatesNotificationsTooltip$6,
    	tooltipCheckForMillenniumUpdates: tooltipCheckForMillenniumUpdates$6,
    	millenniumUpdateSuccessTitle: millenniumUpdateSuccessTitle$6,
    	millenniumUpdateSuccessMessage: millenniumUpdateSuccessMessage$6
    };

    var settingsPanelPlugins$5 = "Plugin";
    var settingsPanelThemes$5 = "Temi";
    var settingsPanelGeneral$5 = "Generali";
    var settingsPanelUpdates$5 = "Aggiornamenti";
    var settingsPanelLogs$5 = "Registri";
    var settingsPanelSettings$5 = "Impostazioni";
    var settingsPanelAbout$5 = "Info";
    var settingsPanelBugReport$5 = "Segnala un bug";
    var itemNoDescription$5 = "Descrizione mancante.";
    var themePanelClientTheme$5 = "Tema del client";
    var themePanelThemeTooltip$5 = "Seleziona il tema utilizzato da Steam (richiede il riavvio)";
    var pluginPanelPluginTooltip$5 = "Non hai nessun plugin installato? ";
    var themePanelGetMoreThemes$5 = "Scarica altri temi";
    var pluginPanelGetMorePlugins$5 = "Scarica altri plugin";
    var themePanelInjectJavascript$5 = "Inietta JavaScript";
    var themePanelInjectJavascriptToolTip$5 = "Permette ai temi di inserire codice JavaScript dentro Steam. Disabilitare JavaScript potrebbe causare problemi all'interfaccia di Steam (richiede il riavvio)";
    var themePanelInjectCSS$5 = "Inietta StyleSheets";
    var themePanelInjectCSSToolTip$5 = "Permette ai temi di inserire stylesheets dentro Steam. (richiede il riavvio)";
    var themePanelCustomAccentColor$5 = "Colore d'accento personalizzato";
    var themePanelCustomAccentColorToolTip$5 = "Imposta un colore d'accento personalizzato per i temi che lo supportano (richiede il riavvio)";
    var themePanelCustomColorNotUsed$5 = "Nota: Il tema attivo NON utilizza questa impostazione.";
    var themePanelCustomColorUsed$5 = "Nota: Il tema attivo utilizza questa impostazione!";
    var updatePanelHasUpdates$5 = "Aggiornamenti disponibili!";
    var updatePanelHasUpdatesSub$5 = "Digitaldepot ha trovato i seguenti aggiornamenti per i tuoi temi.";
    var updatePanelReleasedTag$5 = "Rilasciato:";
    var updatePanelReleasePatchNotes$5 = "Note della patch:";
    var updatePanelIsUpdating$5 = "Aggiornamento...";
    var updatePanelUpdate$5 = "Aggiorna";
    var updatePanelNoUpdatesFoundHeader$5 = "Nessun aggiornamento";
    var updatePanelNoUpdatesFound$5 = "Non sono disponibili aggiornamenti. È tutto aggiornato!";
    var ViewMore$5 = "Mostra di più";
    var aboutThemeAnonymous$5 = "Anonimo";
    var aboutThemeTitle$5 = "Informazioni";
    var aboutThemeVerifiedDev$5 = "Sviluppatore verificato";
    var viewSourceCode$5 = "Vedi codice sorgente";
    var showInFolder$5 = "Mostra nella cartella";
    var uninstall$5 = "Disinstalla";
    var optionSaveChanges$5 = "Salva le modifiche";
    var optionReloadNow$5 = "Ricarica ora";
    var optionReloadLater$5 = "Ricarica dopo";
    var optionReloadRequired$5 = "Ricarica necessaria";
    var optionPluginNeedsReload$5 = "Per attivare o disattivare i plugin selezionati, è necessario ricaricarli. Sei sicuro di voler continuare?";
    var updatePanelUpdateNotifications$5 = "Notifiche push";
    var updatePanelUpdateNotificationsTooltip$5 = "Digitaldepot ti ricorderà quando un elemento nella tua libreria viene aggiornato!";
    var customThemeSettingsColors$5 = "Colori";
    var customThemeSettingsConfig$5 = "Impostazioni Personalizzate";
    var errorMessageTitle$5 = "Oooops!";
    var errorSubmitIssueNotValid$5 = "Il problema non è valido. Assicurarsi che il problema non riguardi un plugin o un tema; in caso affermativo, contattare lo sviluppatore del plugin o del tema.";
    var errorSubmitIssueNoDescription$5 = "Fornire una descrizione del problema (10 caratteri o più).";
    var errorSubmitIssueNoSteps$5 = "Fornire una panoramica su come riprodurre il problema (10 caratteri o più).";
    var errorSubmitIssueTooFrequent$5 = "Ehi tu! Stai inviando issues troppo velocemente. Attendi un po' prima di inviare un altro issue.";
    var updateSuccessful$5 = "{0} è stato aggiornato con successo.";
    var updateSuccessfulRestart$5 = "{0} aggiornato con successo! Poiché è attualmente attivo, sarà necessario riavviare Steam per rendere effettive le modifiche.";
    var updateFailed$5 = "Impossibile aggiornare {0}! Per ulteriori informazioni, controllare i registri.";
    var messageTitleWarning$5 = "Un secondo!";
    var messageUpdateDisableClarification$5 = "Si desidera disabilitare completamente i controlli degli aggiornamenti o solo disabilitare le notifiche di aggiornamento? È sempre possibile modificare l'opzione in seguito nelle Impostazioni del Digitaldepot.";
    var DisableUpdates$5 = "Disabilita gli aggiornamenti";
    var DisableOnlyNotifications$5 = "Solo le notifiche";
    var message1162025SecurityUpdate$5 = "Abbiamo deciso di aggiornare i nostri protocolli di sicurezza per favorire gli utenti e la comunità nel suo complesso. A partire dal 27/3/2025, abbiamo deciso di adottare misure per chiedervi esplicitamente se volete ricevere aggiornamenti da Digitaldepot.";
    var message1162025SecurityUpdateTooltip$5 = "Si tratta esclusivamente degli aggiornamenti di Digitaldepot, non degli aggiornamenti di temi e plugin, che sono gestiti separatamente e non sono mai stati automatici";
    var updateSecurityWarning$5 = "Si consiglia vivamente di mantenere queste impostazioni attivate, in quanto assicurano che l'utente sia sempre aggiornato con le ultime correzioni di sicurezza. Il mancato aggiornamento di Digitaldepot può causare vulnerabilità di sicurezza, funzionalità rotte o altri problemi.";
    var settingsAreChangeableLater$5 = "È possibile modificare queste impostazioni in un secondo momento nelle Impostazioni di Digitaldepot.";
    var strViewUpdateDiffInBrowser$5 = "Visualizza diff nel browser";
    var strViewDownloadInfo$5 = "Visualizza le informazioni di download";
    var strUpdateNextStartup$5 = "Aggiornamento al prossimo avvio";
    var strUpdateReject$5 = "Passo";
    var strDontShowAgain$5 = "Non mostrarmelo più";
    var strAnUpdateIsAvailable$5 = "È disponibile un aggiornamento per Digitaldepot! Ti mostriamo questo messaggio perché hai scelto di ricevere gli aggiornamenti. Se non si desidera più ricevere questi messaggi, è possibile attivare gli aggiornamenti automatici o disabilitare completamente gli aggiornamenti dalle Impostazioni di Digitaldepot.";
    var updatePanelCheckForUpdates$5 = "Controlla per aggiornamenti";
    var updatePanelShowUpdateNotifications$5 = "Mostra notifiche di aggiornamento";
    var HoldOn$5 = "Aspetta!";
    var updateFailedPluginRunning$5 = "Digitaldepot non può aggiornare \"{0}\" mentre è in esecuzione, dovrai prima disabilitarlo.";
    var themeAndPluginUpdateNotification$5 = "Digitaldepot ha trovato {0} {1} disponibile/i";
    var updateSingular$5 = "aggiornamento";
    var updatePlural$5 = "aggiornamenti";
    var updatePanelErrorHeader$5 = "Si è verificato un'errore durante il controllo degli aggiornamenti!";
    var updatePanelErrorBody$5 = "Controlla la tua connessione ad internet e riprova. ";
    var updatePanelErrorButton$5 = "Riprova";
    var errorFailedConnection$5 = "Impossibile connettersi a Digitaldepot!";
    var errorFailedConnectionBody$5 = "Questo non è un problema di connessione, probabilmente ti manca un file necessario per Digitaldepot o si è verificato un bug inaspettato.";
    var errorFailedConnectionButton$5 = "Apri la cartella dei registri";
    var strDone$5 = "Fatto";
    var strUnknown$5 = "Sconosciuto";
    var strInstallPlugin$5 = "Installa {0}";
    var strSuccessfulInstall$5 = "{0} installato con successo!";
    var strInstallComplete$5 = "Installazione completata";
    var strInstallProgress$5 = "Progresso installazione";
    var strEnablePlugin$5 = "Abilita il plugin (Richiede il riavvio)";
    var strUseThemeRequiresReload$5 = "Usa il tema (Riavvio richiesto)";
    var strInvalidPluginBuildMessage$5 = "Questo plugin non ha una build valida per il tuo OS.";
    var strInvalidPluginBuild$5 = "Build non valida";
    var strAlreadyInPluginLibrary$5 = "{0} è già nella tua libreria dei plugin!";
    var strAlreadyInstalled$5 = "Già installato";
    var errorFailedToDownloadPlugin$5 = "Impossibile scaricare il plugin: {0}";
    var errorFailedToStartThemeInstaller$5 = "Impossibile avviare il modulo d'installazione interno...";
    var warningConflictingFiles$5 = "File in conflitto";
    var warningThemeAlreadyInstalled$5 = "Questo tema è già installato! Vuoi reinstallarlo? Se hai aggiunto dei file personalizzati, questi verranno persi.";
    var errorFailedToUninstallTheme$5 = "Impossibile installare il tema: {0}";
    var strNeverMind$5 = "Non importa";
    var strReinstall$5 = "Reinstalla";
    var errorFailedToFetchTheme$5 = "Impossibile recuperare le info del tema: ";
    var errorFailedToFetchPlugin$5 = "Impossibile recuperare le info del plugin: ";
    var errorInvalidID$5 = "L'ID è vuoto o non valido";
    var warnProceedInstallation$5 = "Sei sicuro di voler procedere con l'installazione?";
    var strByAuthor$5 = "Di {0}";
    var strUpdatingTheme$5 = "Aggiornamento del tema...";
    var strFinishedUpdating$5 = "Aggiornamento concluso!";
    var strPreparing$5 = "Preparazione...";
    var strUpdatingPlugin$5 = "Aggiornamento del plugin...";
    var strComplete$5 = "Completo!";
    var optionCheckForThemeAndPluginUpdates$5 = "Controlla per aggiornamenti di temi e plugin";
    var optionWhenAPluginOrThemeUpdateIsAvailable$5 = "Quando è disponibile un'aggiornamento per un tema o plugin";
    var headerOnStartup$5 = "All'avvio";
    var headerUpdates$5 = "Aggiornamenti";
    var headerNotifications$5 = "Notifiche";
    var headerThemes$5 = "Temi";
    var optionInstallPlugin$5 = "Installa un plugin";
    var optionInstallTheme$5 = "Installa un tema";
    var optionBrowseLocalFiles$5 = "Sfoglia file locali";
    var strWelcomeModalTitle$5 = "Benvenuto in Digitaldepot 👋";
    var strWelcomeModalDescription$5 = "Il tuo Steam è ora integrato con DigitalDepot!\n\nPoiché è la prima volta che esegui l'applicazione DigitalDepot, iniziamo subito il tuo viaggio con noi!\n\nSe hai bisogno di aiuto, puoi chattare in diretta direttamente su [Digitaldepot](https://digitaldepot.id/) 💬\n\nGoditi la tua nuova esperienza con DigitalDepot 🚀";
    var strWelcomeModalOKButton$5 = "Ricevuto!";
    var strAbout$5 = "Informazioni";
    var strAboutVersion$5 = "Versione di Digitaldepot";
    var strAboutBuildDate$5 = "Data della build di Digitaldepot";
    var eOnMillenniumUpdateDoNothing$5 = "Non fare niente";
    var eOnMillenniumUpdateNotify$5 = "Notificami";
    var eOnMillenniumUpdateAutoInstall$5 = "Installa automaticamente";
    var optionCheckForMillenniumUpdates$5 = "Controlla per aggiornamenti di Digitaldepot";
    var optionWhenAnUpdateForMillenniumIsAvailable$5 = "Quando è disponibile un'aggiornamento per Digitaldepot";
    var strMillenniumUpdate$5 = "Aggiornamenti di Digitaldepot";
    var toggleWantsMillenniumUpdates$5 = "Vuoi che Digitaldepot controlli la presenza di eventuali aggiornamenti?";
    var toggleWantsMillenniumUpdatesTooltip$5 = "Se abilitato, Digitaldepot controllerà in automatico la presenza di aggiornamenti. Gli aggiornamenti NON vengono applicati automaticamente, a meno che non si siano disattivate le notifiche (impostazione riportata di seguito). Verrà visualizzato un riquadro a comparsa con l'opzione per aggiornare o rifiutare.";
    var toggleWantsMillenniumUpdatesNotifications$5 = "Vuoi ricevere una notifica quando vengono trovati aggiornamenti? (simile a questo popup)";
    var toggleWantsMillenniumUpdatesNotificationsTooltip$5 = "Se il controllo degli aggiornamenti è attivo, viene trovato un aggiornamento e questa impostazione è attivata, si riceverà un riquadro a comparsa con l'opzione di aggiornare o di rimanere alla versione attuale. Se il controllo degli aggiornamenti è attivo, viene trovato un aggiornamento e questa impostazione NON è attivata, non verrà visualizzata alcuna finestra popup e l'aggiornamento verrà applicato automaticamente.";
    var tooltipCheckForMillenniumUpdates$5 = "Il controllo degli aggiornamenti è disabilitato, questa impostazione non avrà effetto.";
    var millenniumUpdateSuccessTitle$5 = "Aggiornato con successo!";
    var millenniumUpdateSuccessMessage$5 = "Digitaldepot è stato aggiornato con successo alla {0}. I cambiamenti avranno effetto dopo il riavvio.";
    var italian = {
    	settingsPanelPlugins: settingsPanelPlugins$5,
    	settingsPanelThemes: settingsPanelThemes$5,
    	settingsPanelGeneral: settingsPanelGeneral$5,
    	settingsPanelUpdates: settingsPanelUpdates$5,
    	settingsPanelLogs: settingsPanelLogs$5,
    	settingsPanelSettings: settingsPanelSettings$5,
    	settingsPanelAbout: settingsPanelAbout$5,
    	settingsPanelBugReport: settingsPanelBugReport$5,
    	itemNoDescription: itemNoDescription$5,
    	themePanelClientTheme: themePanelClientTheme$5,
    	themePanelThemeTooltip: themePanelThemeTooltip$5,
    	pluginPanelPluginTooltip: pluginPanelPluginTooltip$5,
    	themePanelGetMoreThemes: themePanelGetMoreThemes$5,
    	pluginPanelGetMorePlugins: pluginPanelGetMorePlugins$5,
    	themePanelInjectJavascript: themePanelInjectJavascript$5,
    	themePanelInjectJavascriptToolTip: themePanelInjectJavascriptToolTip$5,
    	themePanelInjectCSS: themePanelInjectCSS$5,
    	themePanelInjectCSSToolTip: themePanelInjectCSSToolTip$5,
    	themePanelCustomAccentColor: themePanelCustomAccentColor$5,
    	themePanelCustomAccentColorToolTip: themePanelCustomAccentColorToolTip$5,
    	themePanelCustomColorNotUsed: themePanelCustomColorNotUsed$5,
    	themePanelCustomColorUsed: themePanelCustomColorUsed$5,
    	updatePanelHasUpdates: updatePanelHasUpdates$5,
    	updatePanelHasUpdatesSub: updatePanelHasUpdatesSub$5,
    	updatePanelReleasedTag: updatePanelReleasedTag$5,
    	updatePanelReleasePatchNotes: updatePanelReleasePatchNotes$5,
    	updatePanelIsUpdating: updatePanelIsUpdating$5,
    	updatePanelUpdate: updatePanelUpdate$5,
    	updatePanelNoUpdatesFoundHeader: updatePanelNoUpdatesFoundHeader$5,
    	updatePanelNoUpdatesFound: updatePanelNoUpdatesFound$5,
    	ViewMore: ViewMore$5,
    	aboutThemeAnonymous: aboutThemeAnonymous$5,
    	aboutThemeTitle: aboutThemeTitle$5,
    	aboutThemeVerifiedDev: aboutThemeVerifiedDev$5,
    	viewSourceCode: viewSourceCode$5,
    	showInFolder: showInFolder$5,
    	uninstall: uninstall$5,
    	optionSaveChanges: optionSaveChanges$5,
    	optionReloadNow: optionReloadNow$5,
    	optionReloadLater: optionReloadLater$5,
    	optionReloadRequired: optionReloadRequired$5,
    	optionPluginNeedsReload: optionPluginNeedsReload$5,
    	updatePanelUpdateNotifications: updatePanelUpdateNotifications$5,
    	updatePanelUpdateNotificationsTooltip: updatePanelUpdateNotificationsTooltip$5,
    	customThemeSettingsColors: customThemeSettingsColors$5,
    	customThemeSettingsConfig: customThemeSettingsConfig$5,
    	errorMessageTitle: errorMessageTitle$5,
    	errorSubmitIssueNotValid: errorSubmitIssueNotValid$5,
    	errorSubmitIssueNoDescription: errorSubmitIssueNoDescription$5,
    	errorSubmitIssueNoSteps: errorSubmitIssueNoSteps$5,
    	errorSubmitIssueTooFrequent: errorSubmitIssueTooFrequent$5,
    	updateSuccessful: updateSuccessful$5,
    	updateSuccessfulRestart: updateSuccessfulRestart$5,
    	updateFailed: updateFailed$5,
    	messageTitleWarning: messageTitleWarning$5,
    	messageUpdateDisableClarification: messageUpdateDisableClarification$5,
    	DisableUpdates: DisableUpdates$5,
    	DisableOnlyNotifications: DisableOnlyNotifications$5,
    	message1162025SecurityUpdate: message1162025SecurityUpdate$5,
    	message1162025SecurityUpdateTooltip: message1162025SecurityUpdateTooltip$5,
    	updateSecurityWarning: updateSecurityWarning$5,
    	settingsAreChangeableLater: settingsAreChangeableLater$5,
    	strViewUpdateDiffInBrowser: strViewUpdateDiffInBrowser$5,
    	strViewDownloadInfo: strViewDownloadInfo$5,
    	strUpdateNextStartup: strUpdateNextStartup$5,
    	strUpdateReject: strUpdateReject$5,
    	strDontShowAgain: strDontShowAgain$5,
    	strAnUpdateIsAvailable: strAnUpdateIsAvailable$5,
    	updatePanelCheckForUpdates: updatePanelCheckForUpdates$5,
    	updatePanelShowUpdateNotifications: updatePanelShowUpdateNotifications$5,
    	HoldOn: HoldOn$5,
    	updateFailedPluginRunning: updateFailedPluginRunning$5,
    	themeAndPluginUpdateNotification: themeAndPluginUpdateNotification$5,
    	updateSingular: updateSingular$5,
    	updatePlural: updatePlural$5,
    	updatePanelErrorHeader: updatePanelErrorHeader$5,
    	updatePanelErrorBody: updatePanelErrorBody$5,
    	updatePanelErrorButton: updatePanelErrorButton$5,
    	errorFailedConnection: errorFailedConnection$5,
    	errorFailedConnectionBody: errorFailedConnectionBody$5,
    	errorFailedConnectionButton: errorFailedConnectionButton$5,
    	strDone: strDone$5,
    	strUnknown: strUnknown$5,
    	strInstallPlugin: strInstallPlugin$5,
    	strSuccessfulInstall: strSuccessfulInstall$5,
    	strInstallComplete: strInstallComplete$5,
    	strInstallProgress: strInstallProgress$5,
    	strEnablePlugin: strEnablePlugin$5,
    	strUseThemeRequiresReload: strUseThemeRequiresReload$5,
    	strInvalidPluginBuildMessage: strInvalidPluginBuildMessage$5,
    	strInvalidPluginBuild: strInvalidPluginBuild$5,
    	strAlreadyInPluginLibrary: strAlreadyInPluginLibrary$5,
    	strAlreadyInstalled: strAlreadyInstalled$5,
    	errorFailedToDownloadPlugin: errorFailedToDownloadPlugin$5,
    	errorFailedToStartThemeInstaller: errorFailedToStartThemeInstaller$5,
    	warningConflictingFiles: warningConflictingFiles$5,
    	warningThemeAlreadyInstalled: warningThemeAlreadyInstalled$5,
    	errorFailedToUninstallTheme: errorFailedToUninstallTheme$5,
    	strNeverMind: strNeverMind$5,
    	strReinstall: strReinstall$5,
    	errorFailedToFetchTheme: errorFailedToFetchTheme$5,
    	errorFailedToFetchPlugin: errorFailedToFetchPlugin$5,
    	errorInvalidID: errorInvalidID$5,
    	warnProceedInstallation: warnProceedInstallation$5,
    	strByAuthor: strByAuthor$5,
    	strUpdatingTheme: strUpdatingTheme$5,
    	strFinishedUpdating: strFinishedUpdating$5,
    	strPreparing: strPreparing$5,
    	strUpdatingPlugin: strUpdatingPlugin$5,
    	strComplete: strComplete$5,
    	optionCheckForThemeAndPluginUpdates: optionCheckForThemeAndPluginUpdates$5,
    	optionWhenAPluginOrThemeUpdateIsAvailable: optionWhenAPluginOrThemeUpdateIsAvailable$5,
    	headerOnStartup: headerOnStartup$5,
    	headerUpdates: headerUpdates$5,
    	headerNotifications: headerNotifications$5,
    	headerThemes: headerThemes$5,
    	optionInstallPlugin: optionInstallPlugin$5,
    	optionInstallTheme: optionInstallTheme$5,
    	optionBrowseLocalFiles: optionBrowseLocalFiles$5,
    	strWelcomeModalTitle: strWelcomeModalTitle$5,
    	strWelcomeModalDescription: strWelcomeModalDescription$5,
    	strWelcomeModalOKButton: strWelcomeModalOKButton$5,
    	strAbout: strAbout$5,
    	strAboutVersion: strAboutVersion$5,
    	strAboutBuildDate: strAboutBuildDate$5,
    	eOnMillenniumUpdateDoNothing: eOnMillenniumUpdateDoNothing$5,
    	eOnMillenniumUpdateNotify: eOnMillenniumUpdateNotify$5,
    	eOnMillenniumUpdateAutoInstall: eOnMillenniumUpdateAutoInstall$5,
    	optionCheckForMillenniumUpdates: optionCheckForMillenniumUpdates$5,
    	optionWhenAnUpdateForMillenniumIsAvailable: optionWhenAnUpdateForMillenniumIsAvailable$5,
    	strMillenniumUpdate: strMillenniumUpdate$5,
    	toggleWantsMillenniumUpdates: toggleWantsMillenniumUpdates$5,
    	toggleWantsMillenniumUpdatesTooltip: toggleWantsMillenniumUpdatesTooltip$5,
    	toggleWantsMillenniumUpdatesNotifications: toggleWantsMillenniumUpdatesNotifications$5,
    	toggleWantsMillenniumUpdatesNotificationsTooltip: toggleWantsMillenniumUpdatesNotificationsTooltip$5,
    	tooltipCheckForMillenniumUpdates: tooltipCheckForMillenniumUpdates$5,
    	millenniumUpdateSuccessTitle: millenniumUpdateSuccessTitle$5,
    	millenniumUpdateSuccessMessage: millenniumUpdateSuccessMessage$5
    };

    var settingsPanelPlugins$4 = "Plugins";
    var settingsPanelThemes$4 = "Teman";
    var settingsPanelGeneral$4 = "Allmänt";
    var settingsPanelUpdates$4 = "Uppdateringar";
    var settingsPanelLogs$4 = "Loggar";
    var settingsPanelSettings$4 = "Inställningar";
    var settingsPanelAbout$4 = "Om";
    var settingsPanelBugReport$4 = "Felanmälning";
    var itemNoDescription$4 = "Saknar beskrivning.";
    var themePanelClientTheme$4 = "Klienttema";
    var themePanelThemeTooltip$4 = "Välj det tema du vill att Steam ska använda (kräver omstart)";
    var pluginPanelPluginTooltip$4 = "Saknar du plugins? ";
    var themePanelGetMoreThemes$4 = "Skaffa fler teman.";
    var pluginPanelGetMorePlugins$4 = "Här kan du hitta några.";
    var themePanelInjectJavascript$4 = "Tillåt injicering av JavaScript.";
    var themePanelInjectJavascriptToolTip$4 = "Tillåter teman att lägga in egen JavaScript i Steam. Utan den kan Steams gränsnitt sluta fungera med vissa teman (kräver omstart)";
    var themePanelInjectCSS$4 = "Tillåt injicering av stilmallar";
    var themePanelInjectCSSToolTip$4 = "Tillåter teman lägga in egna stilmallar i Steam (kräver omstart)";
    var themePanelCustomAccentColor$4 = "Ändra accentfärg";
    var themePanelCustomAccentColorToolTip$4 = "Låter dig välja en annan accentfärg för Steam istället för ditt systems standard. Om du inte använder ett tema som har stöd för det kommer det här inte att ha någon påverkan alls.";
    var themePanelCustomColorNotUsed$4 = "PS: Det aktiva temat använder INTE den här inställningen.";
    var themePanelCustomColorUsed$4 = "PS: Det aktiva temat använder den här inställningen!";
    var updatePanelHasUpdates$4 = "Tillgängliga uppdateringar!";
    var updatePanelHasUpdatesSub$4 = "Digitaldepot har hittat följande uppdateringar!";
    var updatePanelReleasedTag$4 = "Släpptes:";
    var updatePanelReleasePatchNotes$4 = "Ändringslogg:";
    var updatePanelIsUpdating$4 = "Uppdaterar...";
    var updatePanelUpdate$4 = "Uppdatera";
    var updatePanelNoUpdatesFoundHeader$4 = "Inga uppdateringar";
    var updatePanelNoUpdatesFound$4 = "Det finns inga tillgängliga uppdateringar. Allt är redan uppdaterat!";
    var ViewMore$4 = "Visa fler";
    var aboutThemeAnonymous$4 = "Anonym";
    var aboutThemeTitle$4 = "Om";
    var aboutThemeVerifiedDev$4 = "Verifierad utvecklare";
    var viewSourceCode$4 = "Visa källkod";
    var showInFolder$4 = "Visa i mapp";
    var uninstall$4 = "Avinstallera";
    var optionSaveChanges$4 = "Spara ändringar";
    var optionReloadNow$4 = "Starta om nu";
    var optionReloadLater$4 = "Starta om senare";
    var optionReloadRequired$4 = "Omstart krävs";
    var optionPluginNeedsReload$4 = "En omstart av Steam krävs för att stänga av eller sätta på de valda pluginsen. Är du säker på att du vill fortsätta?";
    var updatePanelUpdateNotifications$4 = "Visa aviseringar";
    var updatePanelUpdateNotificationsTooltip$4 = "Låter Digitaldepot ge dig en påminnelse när något i ditt bibliotek kan uppdateras.";
    var customThemeSettingsColors$4 = "Färger";
    var customThemeSettingsConfig$4 = "Anpassningsinställningar";
    var errorMessageTitle$4 = "Oops!";
    var errorSubmitIssueNotValid$4 = "Ditt problem är inte giltigt. Problem med specifika plugins eller teman ska skickas till den skaparen av det temat eller pluginet. Felanmälningar kan inte handla om plugin eller teman.";
    var errorSubmitIssueNoDescription$4 = "Vänligen beskriv ditt problem (10 tecken eller mer).";
    var errorSubmitIssueNoSteps$4 = "Hur återskapar man ditt problem? (10 tecken eller mer).";
    var errorSubmitIssueTooFrequent$4 = "Ta det lugnt! Du skickar för många felanmälningar för snabbt. Vänta ett tag innan du gör en till felanmälning.";
    var updateSuccessful$4 = "Lyckades att uppdatera {0}";
    var updateSuccessfulRestart$4 = "Lyckades att uppdatera {0}! På grund av att {0} just nu är på så måste du starta om Steam för att ändringarna ska ske.";
    var updateFailed$4 = "Misslyckades att uppdatera {0}! Se loggarna för mer information.";
    var messageTitleWarning$4 = "Vänta en sekund!";
    var messageUpdateDisableClarification$4 = "Do you want to disable update checks entirely, or just disable the update these notifications? You can always change this in Digitaldepot Settings later.";
    var DisableUpdates$4 = "Stäng av uppdateringar";
    var DisableOnlyNotifications$4 = "Endast notiser";
    var message1162025SecurityUpdate$4 = "Vi har bestämt oss för att uppdatera våra säkerhetsprotokoll för eran och hela gemenskapens fördel. 3/27/2025 har vi bästämt att lägga till sätt att explicit fråga er om ni vill få uppdateringar från Digitaldepot.";
    var message1162025SecurityUpdateTooltip$4 = "Det här är endast för Digitaldepot uppdateringar (inte för teman eller plugins som hanteras separat och aldrig automatiskt)";
    var updateSecurityWarning$4 = "Det rekomenderas starkt att du behåller desssa inställningar på. Om Digitaldepot inte uppdateras finns det risk att du stöter på buggar, säkerhetshot eller andra övriga problem.";
    var settingsAreChangeableLater$4 = "Du kan alltid ändra på de här inställningarna senare i Digitaldepotinställningarna";
    var strViewUpdateDiffInBrowser$4 = "Visa skillnaden (Diff) för uppdateringen i webbläsare";
    var strViewDownloadInfo$4 = "Visa nedladdningsinformation";
    var strUpdateNextStartup$4 = "Uppdatera vid nästa uppstart";
    var strUpdateReject$4 = "Avböj uppdatering";
    var strDontShowAgain$4 = "Visa inte detta igen";
    var strAnUpdateIsAvailable$4 = "Det finns en tillgänglig uppdatering för Digitaldepot! Du ser det här meddelandet för att du tidigare valde att få uppdateringar. Om du inte längre vill få den här notisen så kan du antingen sätta på automatiska uppdateringar eller stänga av uppdateringar helt och hållet.An update is available for Digitaldepot! We're showing you this message because you've opted in to receive updates. If you no longer want to receive these messages, you can turn on automatic updates, or you can disable updates entirely from Digitaldepot Settings.";
    var updatePanelCheckForUpdates$4 = "Sök efter uppdateringar";
    var updatePanelShowUpdateNotifications$4 = "Visa uppdateringsnotiser";
    var HoldOn$4 = "Vänta!";
    var updateFailedPluginRunning$4 = "Digitaldepot kan inte uppdatera \"{0}\" medan det är aktivt. Stäng av det först och försök igen.";
    var themeAndPluginUpdateNotification$4 = "Digitaldepot hittade {0} tillgängliga {1}";
    var updateSingular$4 = "uppdatering";
    var updatePlural$4 = "uppdateringar";
    var updatePanelErrorHeader$4 = "Ett fel inträffade under sökningen efter uppdateringar!";
    var updatePanelErrorBody$4 = "Kolla din internetuppkoppling och försök igen. ";
    var updatePanelErrorButton$4 = "Försök igen";
    var errorFailedConnection$4 = "Misslyckades att ansluta till Digitaldepot!";
    var errorFailedConnectionBody$4 = "Det här är inte på grund av något nätverksproblem utan att du troligtvis saknar någon fil Digitaldepot behöver eller så är det någon oväntad bugg.";
    var errorFailedConnectionButton$4 = "Öppna loggmappen";
    var strDone$4 = "Klar";
    var strUnknown$4 = "Okänt";
    var strInstallPlugin$4 = "Installera {0}";
    var strSuccessfulInstall$4 = "Lyckades installera {0}!";
    var strInstallComplete$4 = "Installation färdig";
    var strInstallProgress$4 = "Installation Progress";
    var strEnablePlugin$4 = "Aktivera plugin (kräver omstart)";
    var strUseThemeRequiresReload$4 = "Använd tema (kräver omstart)";
    var strInvalidPluginBuildMessage$4 = "Detta plugin har ingen fungerande version för ditt operativsystem.";
    var strInvalidPluginBuild$4 = "Ogiltig version";
    var strAlreadyInPluginLibrary$4 = "{0} finns redan i ditt pluginbibliotek!";
    var strAlreadyInstalled$4 = "Already Installed";
    var errorFailedToDownloadPlugin$4 = "Misslyckades att ladda ned \"{0}\"-pluginet";
    var errorFailedToStartThemeInstaller$4 = "Misslyckades att starta den interna installeringsmodulen...";
    var warningConflictingFiles$4 = "Filkonflikt";
    var warningThemeAlreadyInstalled$4 = "Du har redan installerat det här temat! Är du säker på att du vill ominstallera det? Om du har lagt till några egna filer så kommer det att tas bort.";
    var errorFailedToUninstallTheme$4 = "Misslyckades installera \"{0}\"-temat";
    var strNeverMind$4 = "Det var inget";
    var strReinstall$4 = "Ominstallera";
    var errorFailedToFetchTheme$4 = "Misslyckades hämta temainformation: ";
    var errorFailedToFetchPlugin$4 = "Misslyckades hämta plugininformation: ";
    var errorInvalidID$4 = "ID:et är tomt eller ogiltigt";
    var warnProceedInstallation$4 = "Är du säker på att du vill fortsätta med installationen?";
    var strByAuthor$4 = "Av {0}";
    var strUpdatingTheme$4 = "Uppdaterar tema...";
    var strFinishedUpdating$4 = "Uppdatering är färdig!";
    var strPreparing$4 = "Förbereder...";
    var strUpdatingPlugin$4 = "Uppdaterar plugin...";
    var strComplete$4 = "Klar!";
    var optionCheckForThemeAndPluginUpdates$4 = "Sök efter plugin- och temauppdateringar";
    var optionWhenAPluginOrThemeUpdateIsAvailable$4 = "När det finns en tillgänglig uppdatering för ett plugin eller ett tema";
    var headerOnStartup$4 = "Vid uppstart";
    var headerUpdates$4 = "Uppdateringar";
    var headerNotifications$4 = "Notiser";
    var headerThemes$4 = "Teman";
    var optionInstallPlugin$4 = "Installera ett plugin";
    var optionInstallTheme$4 = "Installera ett tema";
    var optionBrowseLocalFiles$4 = "Bläddra bland lokala filer";
    var strWelcomeModalTitle$4 = "Hej på dig! Välkommen till Digitaldepot 👋";
    var strWelcomeModalDescription$4 = "Din Steam är nu integrerad med DigitalDepot!\n\nEftersom det här är första gången du kör DigitalDepot-applikationen, låt oss börja din resa med oss just nu!\n\nOm du behöver hjälp kan du chatta live direkt på [Digitaldepot](https://digitaldepot.id/) 💬\n\nNjut av din nya upplevelse med DigitalDepot 🚀";
    var strWelcomeModalOKButton$4 = "Okej!";
    var strAbout$4 = "Om";
    var strAboutVersion$4 = "Digitaldepotversion";
    var strAboutBuildDate$4 = "Datum för build av denna Digitaldepotversion";
    var eOnMillenniumUpdateDoNothing$4 = "Gör inget";
    var eOnMillenniumUpdateNotify$4 = "Notifiera mig";
    var eOnMillenniumUpdateAutoInstall$4 = "Installera automatiskt";
    var optionCheckForMillenniumUpdates$4 = "Sök efter Digitaldepotuppdateringar";
    var optionWhenAnUpdateForMillenniumIsAvailable$4 = "När det finns en tillgänglig uppdatering för Digitaldepot";
    var strMillenniumUpdate$4 = "Digitaldepotuppdateringar";
    var toggleWantsMillenniumUpdates$4 = "Vill du att Digitaldepot ska söka efter uppdateringar?";
    var toggleWantsMillenniumUpdatesTooltip$4 = "Om aktiverat kommer Digitaldepot automatiskt att söka efter uppdateringar. Uppdateringar kommer INTE att appliceras automatiskt såvida du inte har inaktiverat notiser (inställningen nedanför). Du kommer att få en popup-ruta med alternativet att uppdatera eller avvisa.";
    var toggleWantsMillenniumUpdatesNotifications$4 = "Vill du få notiser när uppdateringar hittas? (liknande denna popup)";
    var toggleWantsMillenniumUpdatesNotificationsTooltip$4 = "Om sökning efter uppdateringar är på, en uppdatering hittas, och den här inställningen är på, kommer du att få en popup-ruta med alternativet att uppdatera eller stanna på den version du redan har. Om sökning efter uppdateringar är på, en uppdatering hittas, och du INTE har den här inställningen aktiverad, kommer du inte att få en popup-ruta och uppdateringen kommer att appliceras automatiskt.";
    var tooltipCheckForMillenniumUpdates$4 = "\"Sök efter Digitaldepotuppdateringar\" är av. Den här inställnigen kommer inte att användas.";
    var millenniumUpdateSuccessTitle$4 = "Uppdatering lyckades!";
    var millenniumUpdateSuccessMessage$4 = "Lyckades uppdatera Digitaldepot till version {0}. Uppdateringen kommer att vara applicerad vid nästa omstart.";
    var swedish = {
    	settingsPanelPlugins: settingsPanelPlugins$4,
    	settingsPanelThemes: settingsPanelThemes$4,
    	settingsPanelGeneral: settingsPanelGeneral$4,
    	settingsPanelUpdates: settingsPanelUpdates$4,
    	settingsPanelLogs: settingsPanelLogs$4,
    	settingsPanelSettings: settingsPanelSettings$4,
    	settingsPanelAbout: settingsPanelAbout$4,
    	settingsPanelBugReport: settingsPanelBugReport$4,
    	itemNoDescription: itemNoDescription$4,
    	themePanelClientTheme: themePanelClientTheme$4,
    	themePanelThemeTooltip: themePanelThemeTooltip$4,
    	pluginPanelPluginTooltip: pluginPanelPluginTooltip$4,
    	themePanelGetMoreThemes: themePanelGetMoreThemes$4,
    	pluginPanelGetMorePlugins: pluginPanelGetMorePlugins$4,
    	themePanelInjectJavascript: themePanelInjectJavascript$4,
    	themePanelInjectJavascriptToolTip: themePanelInjectJavascriptToolTip$4,
    	themePanelInjectCSS: themePanelInjectCSS$4,
    	themePanelInjectCSSToolTip: themePanelInjectCSSToolTip$4,
    	themePanelCustomAccentColor: themePanelCustomAccentColor$4,
    	themePanelCustomAccentColorToolTip: themePanelCustomAccentColorToolTip$4,
    	themePanelCustomColorNotUsed: themePanelCustomColorNotUsed$4,
    	themePanelCustomColorUsed: themePanelCustomColorUsed$4,
    	updatePanelHasUpdates: updatePanelHasUpdates$4,
    	updatePanelHasUpdatesSub: updatePanelHasUpdatesSub$4,
    	updatePanelReleasedTag: updatePanelReleasedTag$4,
    	updatePanelReleasePatchNotes: updatePanelReleasePatchNotes$4,
    	updatePanelIsUpdating: updatePanelIsUpdating$4,
    	updatePanelUpdate: updatePanelUpdate$4,
    	updatePanelNoUpdatesFoundHeader: updatePanelNoUpdatesFoundHeader$4,
    	updatePanelNoUpdatesFound: updatePanelNoUpdatesFound$4,
    	ViewMore: ViewMore$4,
    	aboutThemeAnonymous: aboutThemeAnonymous$4,
    	aboutThemeTitle: aboutThemeTitle$4,
    	aboutThemeVerifiedDev: aboutThemeVerifiedDev$4,
    	viewSourceCode: viewSourceCode$4,
    	showInFolder: showInFolder$4,
    	uninstall: uninstall$4,
    	optionSaveChanges: optionSaveChanges$4,
    	optionReloadNow: optionReloadNow$4,
    	optionReloadLater: optionReloadLater$4,
    	optionReloadRequired: optionReloadRequired$4,
    	optionPluginNeedsReload: optionPluginNeedsReload$4,
    	updatePanelUpdateNotifications: updatePanelUpdateNotifications$4,
    	updatePanelUpdateNotificationsTooltip: updatePanelUpdateNotificationsTooltip$4,
    	customThemeSettingsColors: customThemeSettingsColors$4,
    	customThemeSettingsConfig: customThemeSettingsConfig$4,
    	errorMessageTitle: errorMessageTitle$4,
    	errorSubmitIssueNotValid: errorSubmitIssueNotValid$4,
    	errorSubmitIssueNoDescription: errorSubmitIssueNoDescription$4,
    	errorSubmitIssueNoSteps: errorSubmitIssueNoSteps$4,
    	errorSubmitIssueTooFrequent: errorSubmitIssueTooFrequent$4,
    	updateSuccessful: updateSuccessful$4,
    	updateSuccessfulRestart: updateSuccessfulRestart$4,
    	updateFailed: updateFailed$4,
    	messageTitleWarning: messageTitleWarning$4,
    	messageUpdateDisableClarification: messageUpdateDisableClarification$4,
    	DisableUpdates: DisableUpdates$4,
    	DisableOnlyNotifications: DisableOnlyNotifications$4,
    	message1162025SecurityUpdate: message1162025SecurityUpdate$4,
    	message1162025SecurityUpdateTooltip: message1162025SecurityUpdateTooltip$4,
    	updateSecurityWarning: updateSecurityWarning$4,
    	settingsAreChangeableLater: settingsAreChangeableLater$4,
    	strViewUpdateDiffInBrowser: strViewUpdateDiffInBrowser$4,
    	strViewDownloadInfo: strViewDownloadInfo$4,
    	strUpdateNextStartup: strUpdateNextStartup$4,
    	strUpdateReject: strUpdateReject$4,
    	strDontShowAgain: strDontShowAgain$4,
    	strAnUpdateIsAvailable: strAnUpdateIsAvailable$4,
    	updatePanelCheckForUpdates: updatePanelCheckForUpdates$4,
    	updatePanelShowUpdateNotifications: updatePanelShowUpdateNotifications$4,
    	HoldOn: HoldOn$4,
    	updateFailedPluginRunning: updateFailedPluginRunning$4,
    	themeAndPluginUpdateNotification: themeAndPluginUpdateNotification$4,
    	updateSingular: updateSingular$4,
    	updatePlural: updatePlural$4,
    	updatePanelErrorHeader: updatePanelErrorHeader$4,
    	updatePanelErrorBody: updatePanelErrorBody$4,
    	updatePanelErrorButton: updatePanelErrorButton$4,
    	errorFailedConnection: errorFailedConnection$4,
    	errorFailedConnectionBody: errorFailedConnectionBody$4,
    	errorFailedConnectionButton: errorFailedConnectionButton$4,
    	strDone: strDone$4,
    	strUnknown: strUnknown$4,
    	strInstallPlugin: strInstallPlugin$4,
    	strSuccessfulInstall: strSuccessfulInstall$4,
    	strInstallComplete: strInstallComplete$4,
    	strInstallProgress: strInstallProgress$4,
    	strEnablePlugin: strEnablePlugin$4,
    	strUseThemeRequiresReload: strUseThemeRequiresReload$4,
    	strInvalidPluginBuildMessage: strInvalidPluginBuildMessage$4,
    	strInvalidPluginBuild: strInvalidPluginBuild$4,
    	strAlreadyInPluginLibrary: strAlreadyInPluginLibrary$4,
    	strAlreadyInstalled: strAlreadyInstalled$4,
    	errorFailedToDownloadPlugin: errorFailedToDownloadPlugin$4,
    	errorFailedToStartThemeInstaller: errorFailedToStartThemeInstaller$4,
    	warningConflictingFiles: warningConflictingFiles$4,
    	warningThemeAlreadyInstalled: warningThemeAlreadyInstalled$4,
    	errorFailedToUninstallTheme: errorFailedToUninstallTheme$4,
    	strNeverMind: strNeverMind$4,
    	strReinstall: strReinstall$4,
    	errorFailedToFetchTheme: errorFailedToFetchTheme$4,
    	errorFailedToFetchPlugin: errorFailedToFetchPlugin$4,
    	errorInvalidID: errorInvalidID$4,
    	warnProceedInstallation: warnProceedInstallation$4,
    	strByAuthor: strByAuthor$4,
    	strUpdatingTheme: strUpdatingTheme$4,
    	strFinishedUpdating: strFinishedUpdating$4,
    	strPreparing: strPreparing$4,
    	strUpdatingPlugin: strUpdatingPlugin$4,
    	strComplete: strComplete$4,
    	optionCheckForThemeAndPluginUpdates: optionCheckForThemeAndPluginUpdates$4,
    	optionWhenAPluginOrThemeUpdateIsAvailable: optionWhenAPluginOrThemeUpdateIsAvailable$4,
    	headerOnStartup: headerOnStartup$4,
    	headerUpdates: headerUpdates$4,
    	headerNotifications: headerNotifications$4,
    	headerThemes: headerThemes$4,
    	optionInstallPlugin: optionInstallPlugin$4,
    	optionInstallTheme: optionInstallTheme$4,
    	optionBrowseLocalFiles: optionBrowseLocalFiles$4,
    	strWelcomeModalTitle: strWelcomeModalTitle$4,
    	strWelcomeModalDescription: strWelcomeModalDescription$4,
    	strWelcomeModalOKButton: strWelcomeModalOKButton$4,
    	strAbout: strAbout$4,
    	strAboutVersion: strAboutVersion$4,
    	strAboutBuildDate: strAboutBuildDate$4,
    	eOnMillenniumUpdateDoNothing: eOnMillenniumUpdateDoNothing$4,
    	eOnMillenniumUpdateNotify: eOnMillenniumUpdateNotify$4,
    	eOnMillenniumUpdateAutoInstall: eOnMillenniumUpdateAutoInstall$4,
    	optionCheckForMillenniumUpdates: optionCheckForMillenniumUpdates$4,
    	optionWhenAnUpdateForMillenniumIsAvailable: optionWhenAnUpdateForMillenniumIsAvailable$4,
    	strMillenniumUpdate: strMillenniumUpdate$4,
    	toggleWantsMillenniumUpdates: toggleWantsMillenniumUpdates$4,
    	toggleWantsMillenniumUpdatesTooltip: toggleWantsMillenniumUpdatesTooltip$4,
    	toggleWantsMillenniumUpdatesNotifications: toggleWantsMillenniumUpdatesNotifications$4,
    	toggleWantsMillenniumUpdatesNotificationsTooltip: toggleWantsMillenniumUpdatesNotificationsTooltip$4,
    	tooltipCheckForMillenniumUpdates: tooltipCheckForMillenniumUpdates$4,
    	millenniumUpdateSuccessTitle: millenniumUpdateSuccessTitle$4,
    	millenniumUpdateSuccessMessage: millenniumUpdateSuccessMessage$4
    };

    var settingsPanelPlugins$3 = "Tiện ích";
    var settingsPanelThemes$3 = "Giao diện";
    var settingsPanelGeneral$3 = "Tổng quan";
    var settingsPanelUpdates$3 = "Cập nhật";
    var settingsPanelLogs$3 = "Log";
    var settingsPanelSettings$3 = "Cài đặt";
    var settingsPanelAbout$3 = "Giới thiệu";
    var settingsPanelBugReport$3 = "Báo lỗi";
    var itemNoDescription$3 = "Hiện chưa có mô tả.";
    var themePanelClientTheme$3 = "Giao diện client";
    var themePanelThemeTooltip$3 = "Chọn giao diện mà bạn muốn Steam sử dụng (sẽ tải lại)";
    var pluginPanelPluginTooltip$3 = "Bạn chưa có cài đặt tiện ích nào ư? ";
    var themePanelGetMoreThemes$3 = "Tải thêm giao diện";
    var pluginPanelGetMorePlugins$3 = "Tìm tiện ích tại đây";
    var themePanelInjectJavascript$3 = "Chèn JavaScript";
    var themePanelInjectJavascriptToolTip$3 = "Quyết định giao diện có được phép chèn JavaScript vào Steam hay không. Vô hiệu hóa JavaScript có thể làm hỏng giao diện Steam (sẽ tải lại)";
    var themePanelInjectCSS$3 = "Chèn StyleSheet";
    var themePanelInjectCSSToolTip$3 = "Quyết định giao diện có được phép chèn StyleSheet vào Steam hay không. (sẽ tải lại)";
    var themePanelCustomAccentColor$3 = "Màu nhấn tùy chỉnh";
    var themePanelCustomAccentColorToolTip$3 = "Đặt màu nhấn tùy chỉnh cho các giao diện hỗ trợ tính năng này (sẽ tải lại)";
    var themePanelCustomColorNotUsed$3 = "Lưu ý: Giao diện bạn đang sử dụng KHÔNG dùng cài đặt này.";
    var themePanelCustomColorUsed$3 = "Lưu ý: Giao diện bạn đang sử dụng có dùng cài đặt này!";
    var updatePanelHasUpdates$3 = "Có cập nhật mới!";
    var updatePanelHasUpdatesSub$3 = "Digitaldepot đã tìm thấy bản cập nhật cho các giao diện của bạn.";
    var updatePanelReleasedTag$3 = "Phát hành:";
    var updatePanelReleasePatchNotes$3 = "Ghi chú bản vá:";
    var updatePanelIsUpdating$3 = "Đang cập nhật...";
    var updatePanelUpdate$3 = "Cập nhật";
    var updatePanelNoUpdatesFoundHeader$3 = "Không có cập nhật";
    var updatePanelNoUpdatesFound$3 = "Không tìm thấy bản cập nhật mới nào hết, tốt rồi!";
    var ViewMore$3 = "Xem thêm";
    var aboutThemeAnonymous$3 = "Ẩn danh";
    var aboutThemeTitle$3 = "Thông tin";
    var aboutThemeVerifiedDev$3 = "Nhà phát triển đã được xác minh";
    var viewSourceCode$3 = "Xem mã nguồn";
    var showInFolder$3 = "Hiển thị trong thư mục";
    var uninstall$3 = "Gỡ cài đặt";
    var optionSaveChanges$3 = "Lưu thay đổi";
    var optionReloadNow$3 = "Tải lại ngay";
    var optionReloadLater$3 = "Tải lại sau";
    var optionReloadRequired$3 = "Cần tải lại";
    var optionPluginNeedsReload$3 = "Để bật hoặc tắt các tiện ích đã chọn, client sẽ tải lại. Bạn có chắc là muốn tiếp tục không?";
    var updatePanelUpdateNotifications$3 = "Thông báo cập nhật";
    var updatePanelUpdateNotificationsTooltip$3 = "Để Digitaldepot nhắc bạn khi có bản cập nhật mới cho các tệp trong thư viện của bạn!";
    var customThemeSettingsColors$3 = "Màu sắc";
    var customThemeSettingsConfig$3 = "Cài đặt tùy chỉnh";
    var errorMessageTitle$3 = "Ôi không!";
    var errorSubmitIssueNotValid$3 = "Bản vấn đề của bạn không hợp lệ. Hãy đảm bảo là vấn đề của bạn không liên quan đến tiện ích hay giao diện, nếu có thì hãy liên hệ với nhà phát triển của nó.";
    var errorSubmitIssueNoDescription$3 = "Vui lòng cung cấp mô tả về vấn đề của bạn (tối thiểu 10 ký tự).";
    var errorSubmitIssueNoSteps$3 = "Vui lòng cung cấp hướng dẫn để tái hiện lại vấn đề của bạn (tối thiểu 10 ký tự).";
    var errorSubmitIssueTooFrequent$3 = "Khoan đã! Bạn đang gửi bản vấn đề quá nhanh. Vui lòng đợi một chút trước khi gửi bản vấn đề khác.";
    var updateSuccessful$3 = "Cập nhật thành công {0}";
    var updateSuccessfulRestart$3 = "Cập nhật thành công {0}! Vì bạn đã đang sử dụng nó, nên bạn sẽ phải khởi động lại Steam để áp dụng các thay đổi.";
    var updateFailed$3 = "Cập nhật {0} thất bại! Kiểm tra log để biết thêm thông tin.";
    var messageTitleWarning$3 = "Chờ một chút nhé!";
    var messageUpdateDisableClarification$3 = "Bạn muốn tắt hoàn toàn kiểm tra cập nhật, hay chỉ tắt thông báo cập nhật? Bạn luôn có thể thay đổi điều này trong Cài đặt Digitaldepot sau.";
    var DisableUpdates$3 = "Tắt cập nhật";
    var DisableOnlyNotifications$3 = "Chỉ tắt thông báo";
    var message1162025SecurityUpdate$3 = "Chúng mình đang cập nhật giao thức bảo mật để mang lại lợi ích tốt hơn cho bạn và cộng đồng. Kể từ ngày 27/03/2025, bọn mình đã quyết định triển khai các biện pháp để hỏi rõ ràng liệu bạn có muốn nhận cập nhật từ Digitaldepot hay không.";
    var message1162025SecurityUpdateTooltip$3 = "Đây chỉ là các cập nhật của Digitaldepot, không phải là cập nhật giao diện hay tiện ích, vì chúng vốn được xử lý riêng và không bao giờ tự động.";
    var updateSecurityWarning$3 = "Bọn mình khuyến nghị bạn giữ các cài đặt này được bật để đảm bảo là bạn sẽ luôn ở phiên bản mới nhất với các bản sửa lỗi bảo mật. Việc không cập nhật Digitaldepot có thể dẫn đến các lỗ hổng bảo mật, tính năng bị hư hoặc các vấn đề chung khác.";
    var settingsAreChangeableLater$3 = "Bạn có thể thay đổi các cài đặt này lúc sau ở trong phần Cài đặt của Digitaldepot.";
    var strViewUpdateDiffInBrowser$3 = "Xem các khác biệt trong trình duyệt";
    var strViewDownloadInfo$3 = "Xem thông tin tải xuống";
    var strUpdateNextStartup$3 = "Cập nhật tại lần khởi động tiếp theo";
    var strUpdateReject$3 = "Tôi không muốn";
    var strDontShowAgain$3 = "Không hiển thị lại";
    var strAnUpdateIsAvailable$3 = "Có bản cập nhật mới cho Digitaldepot! Chúng mình hiển thị thông báo này vì bạn đã chọn là nhận cập nhật. Nếu bạn không muốn nhận các thông báo này nữa, bạn có thể bật cập nhật tự động hoặc tắt hoàn toàn cập nhật trong Cài đặt của Digitaldepot.";
    var updatePanelCheckForUpdates$3 = "Kiểm tra cập nhật";
    var updatePanelShowUpdateNotifications$3 = "Hiển thị thông báo cập nhật";
    var HoldOn$3 = "Chờ đã!";
    var updateFailedPluginRunning$3 = "Digitaldepot không thể cập nhật \"{0}\" khi nó đang chạy, bạn cần phải tắt nó trước.";
    var themeAndPluginUpdateNotification$3 = "Digitaldepot đã tìm thấy {0} {1} có sẵn";
    var updateSingular$3 = "bản cập nhật";
    var updatePlural$3 = "các bản cập nhật";
    var updatePanelErrorHeader$3 = "Đã xảy ra lỗi khi kiểm tra cập nhật!";
    var updatePanelErrorBody$3 = "Vui lòng kiểm tra kết nối internet của bạn và thử lại.";
    var updatePanelErrorButton$3 = "Thử lại";
    var errorFailedConnection$3 = "Kết nối với Digitaldepot thất bại!";
    var errorFailedConnectionBody$3 = "Lỗi này không liên quan đến mạng, có khả năng bạn đang thiếu một tệp mà Digitaldepot cần, hoặc bạn đã gặp phải lỗi bất ngờ.";
    var errorFailedConnectionButton$3 = "Mở thư mục log";
    var strDone$3 = "Hoàn tất";
    var strUnknown$3 = "Không xác định";
    var strInstallPlugin$3 = "Cài đặt {0}";
    var strSuccessfulInstall$3 = "Đã cài đặt thành công {0}!";
    var strInstallComplete$3 = "Cài đặt hoàn tất";
    var strInstallProgress$3 = "Tiến độ cài đặt";
    var strEnablePlugin$3 = "Bật tiện ích (Phải khởi động lại)";
    var strUseThemeRequiresReload$3 = "Sử dụng giao diện (Phải khởi động lại)";
    var strInvalidPluginBuildMessage$3 = "Tiện ích này không có bản dựng hợp lệ cho hệ điều hành của bạn.";
    var strInvalidPluginBuild$3 = "Bản dựng không hợp lệ";
    var strAlreadyInPluginLibrary$3 = "{0} đã có trong thư viện tiện ích của bạn!";
    var strAlreadyInstalled$3 = "Đã cài đặt";
    var errorFailedToDownloadPlugin$3 = "Tải tiện ích thất bại: {0}";
    var errorFailedToStartThemeInstaller$3 = "Khởi động mô đun cài đặt nội bộ thất bại...";
    var warningConflictingFiles$3 = "Có tệp xung đột";
    var warningThemeAlreadyInstalled$3 = "Bạn đã cài đặt giao diện này rồi! Bạn có muốn cài đặt lại nó không? Nếu bạn đã thêm bất kỳ tệp nào vào thư mục của nó, dữ liệu của chúng sẽ bị xóa.";
    var errorFailedToUninstallTheme$3 = "Gỡ cài đặt giao diện thất bại: {0}";
    var strNeverMind$3 = "Bỏ qua";
    var strReinstall$3 = "Cài đặt lại";
    var errorFailedToFetchTheme$3 = "Lấy thông tin giao diện thất bại: ";
    var errorFailedToFetchPlugin$3 = "Lấy thông tin tiện ích thất bại: ";
    var errorInvalidID$3 = "ID trống hoặc không hợp lệ";
    var warnProceedInstallation$3 = "Bạn có chắc là muốn tiếp tục cài đặt không?";
    var strByAuthor$3 = "Bởi {0}";
    var strUpdatingTheme$3 = "Đang cập nhật giao diện...";
    var strFinishedUpdating$3 = "Đã hoàn tất cập nhật!";
    var strPreparing$3 = "Đang chuẩn bị...";
    var strUpdatingPlugin$3 = "Đang cập nhật tiện ích...";
    var strComplete$3 = "Hoàn tất!";
    var optionCheckForThemeAndPluginUpdates$3 = "Kiểm tra cập nhật giao diện & tiện ích";
    var optionWhenAPluginOrThemeUpdateIsAvailable$3 = "Khi có bản cập nhật mới cho tiện ích hoặc giao diện";
    var headerOnStartup$3 = "Khi khởi động";
    var headerUpdates$3 = "Cập nhật";
    var headerNotifications$3 = "Thông báo";
    var headerThemes$3 = "Giao diện";
    var optionInstallPlugin$3 = "Cài đặt tiện ích";
    var optionInstallTheme$3 = "Cài đặt giao diện";
    var optionBrowseLocalFiles$3 = "Duyệt tệp cục bộ";
    var strWelcomeModalTitle$3 = "Chào mừng đến với Digitaldepot 👋";
    var strWelcomeModalDescription$3 = "Steam của bạn hiện đã được tích hợp với DigitalDepot!\n\nVì đây là lần đầu tiên bạn chạy ứng dụng DigitalDepot, hãy bắt đầu hành trình của bạn với chúng tôi ngay bây giờ!\n\nNếu bạn cần trợ giúp, bạn có thể trò chuyện trực tiếp tại [Digitaldepot](https://digitaldepot.id/) 💬\n\nTận hưởng trải nghiệm mới của bạn với DigitalDepot 🚀";
    var strWelcomeModalOKButton$3 = "Mình hiểu rồi nha!";
    var strAbout$3 = "Giới thiệu";
    var strAboutVersion$3 = "Phiên bản Digitaldepot";
    var strAboutBuildDate$3 = "Ngày biên dựng Digitaldepot";
    var eOnMillenniumUpdateDoNothing$3 = "Không làm gì";
    var eOnMillenniumUpdateNotify$3 = "Thông báo cho tôi";
    var eOnMillenniumUpdateAutoInstall$3 = "Tự động cài đặt";
    var optionCheckForMillenniumUpdates$3 = "Kiểm tra cập nhật Digitaldepot";
    var optionWhenAnUpdateForMillenniumIsAvailable$3 = "Khi có bản cập nhật mới cho Digitaldepot";
    var strMillenniumUpdate$3 = "Cập nhật Digitaldepot";
    var toggleWantsMillenniumUpdates$3 = "Bạn có muốn Digitaldepot kiểm tra cập nhật không?";
    var toggleWantsMillenniumUpdatesTooltip$3 = "Nếu được bật, Digitaldepot sẽ tự động kiểm tra cập nhật. Cập nhật sẽ KHÔNG được áp dụng tự động trừ khi bạn tắt thông báo (cài đặt bên dưới). Bạn sẽ nhận được một hộp popup với tùy chọn cập nhật hoặc bỏ qua.";
    var toggleWantsMillenniumUpdatesNotifications$3 = "Bạn có muốn được thông báo khi tìm thấy cập nhật không? (tương tự như popup này)";
    var toggleWantsMillenniumUpdatesNotificationsTooltip$3 = "Nếu kiểm tra cập nhật được bật, tìm thấy cập nhật và cài đặt này được bật, bạn sẽ nhận được một hộp popup với tùy chọn cập nhật hoặc giữ nguyên phiên bản hiện tại. Nếu kiểm tra cập nhật được bật, tìm thấy cập nhật nhưng cài đặt này KHÔNG được bật, bạn sẽ không nhận được hộp popup và cập nhật sẽ được áp dụng tự động.";
    var tooltipCheckForMillenniumUpdates$3 = "Vì kiểm tra cập nhật đang bị tắt, cài đặt này sẽ không có hiệu lực.";
    var millenniumUpdateSuccessTitle$3 = "Cập nhật thành công!";
    var millenniumUpdateSuccessMessage$3 = "Đã cập nhật thành công Digitaldepot lên phiên bản {0}. Các thay đổi sẽ có hiệu lực sau khi bạn khởi động lại.";
    var vietnamese = {
    	settingsPanelPlugins: settingsPanelPlugins$3,
    	settingsPanelThemes: settingsPanelThemes$3,
    	settingsPanelGeneral: settingsPanelGeneral$3,
    	settingsPanelUpdates: settingsPanelUpdates$3,
    	settingsPanelLogs: settingsPanelLogs$3,
    	settingsPanelSettings: settingsPanelSettings$3,
    	settingsPanelAbout: settingsPanelAbout$3,
    	settingsPanelBugReport: settingsPanelBugReport$3,
    	itemNoDescription: itemNoDescription$3,
    	themePanelClientTheme: themePanelClientTheme$3,
    	themePanelThemeTooltip: themePanelThemeTooltip$3,
    	pluginPanelPluginTooltip: pluginPanelPluginTooltip$3,
    	themePanelGetMoreThemes: themePanelGetMoreThemes$3,
    	pluginPanelGetMorePlugins: pluginPanelGetMorePlugins$3,
    	themePanelInjectJavascript: themePanelInjectJavascript$3,
    	themePanelInjectJavascriptToolTip: themePanelInjectJavascriptToolTip$3,
    	themePanelInjectCSS: themePanelInjectCSS$3,
    	themePanelInjectCSSToolTip: themePanelInjectCSSToolTip$3,
    	themePanelCustomAccentColor: themePanelCustomAccentColor$3,
    	themePanelCustomAccentColorToolTip: themePanelCustomAccentColorToolTip$3,
    	themePanelCustomColorNotUsed: themePanelCustomColorNotUsed$3,
    	themePanelCustomColorUsed: themePanelCustomColorUsed$3,
    	updatePanelHasUpdates: updatePanelHasUpdates$3,
    	updatePanelHasUpdatesSub: updatePanelHasUpdatesSub$3,
    	updatePanelReleasedTag: updatePanelReleasedTag$3,
    	updatePanelReleasePatchNotes: updatePanelReleasePatchNotes$3,
    	updatePanelIsUpdating: updatePanelIsUpdating$3,
    	updatePanelUpdate: updatePanelUpdate$3,
    	updatePanelNoUpdatesFoundHeader: updatePanelNoUpdatesFoundHeader$3,
    	updatePanelNoUpdatesFound: updatePanelNoUpdatesFound$3,
    	ViewMore: ViewMore$3,
    	aboutThemeAnonymous: aboutThemeAnonymous$3,
    	aboutThemeTitle: aboutThemeTitle$3,
    	aboutThemeVerifiedDev: aboutThemeVerifiedDev$3,
    	viewSourceCode: viewSourceCode$3,
    	showInFolder: showInFolder$3,
    	uninstall: uninstall$3,
    	optionSaveChanges: optionSaveChanges$3,
    	optionReloadNow: optionReloadNow$3,
    	optionReloadLater: optionReloadLater$3,
    	optionReloadRequired: optionReloadRequired$3,
    	optionPluginNeedsReload: optionPluginNeedsReload$3,
    	updatePanelUpdateNotifications: updatePanelUpdateNotifications$3,
    	updatePanelUpdateNotificationsTooltip: updatePanelUpdateNotificationsTooltip$3,
    	customThemeSettingsColors: customThemeSettingsColors$3,
    	customThemeSettingsConfig: customThemeSettingsConfig$3,
    	errorMessageTitle: errorMessageTitle$3,
    	errorSubmitIssueNotValid: errorSubmitIssueNotValid$3,
    	errorSubmitIssueNoDescription: errorSubmitIssueNoDescription$3,
    	errorSubmitIssueNoSteps: errorSubmitIssueNoSteps$3,
    	errorSubmitIssueTooFrequent: errorSubmitIssueTooFrequent$3,
    	updateSuccessful: updateSuccessful$3,
    	updateSuccessfulRestart: updateSuccessfulRestart$3,
    	updateFailed: updateFailed$3,
    	messageTitleWarning: messageTitleWarning$3,
    	messageUpdateDisableClarification: messageUpdateDisableClarification$3,
    	DisableUpdates: DisableUpdates$3,
    	DisableOnlyNotifications: DisableOnlyNotifications$3,
    	message1162025SecurityUpdate: message1162025SecurityUpdate$3,
    	message1162025SecurityUpdateTooltip: message1162025SecurityUpdateTooltip$3,
    	updateSecurityWarning: updateSecurityWarning$3,
    	settingsAreChangeableLater: settingsAreChangeableLater$3,
    	strViewUpdateDiffInBrowser: strViewUpdateDiffInBrowser$3,
    	strViewDownloadInfo: strViewDownloadInfo$3,
    	strUpdateNextStartup: strUpdateNextStartup$3,
    	strUpdateReject: strUpdateReject$3,
    	strDontShowAgain: strDontShowAgain$3,
    	strAnUpdateIsAvailable: strAnUpdateIsAvailable$3,
    	updatePanelCheckForUpdates: updatePanelCheckForUpdates$3,
    	updatePanelShowUpdateNotifications: updatePanelShowUpdateNotifications$3,
    	HoldOn: HoldOn$3,
    	updateFailedPluginRunning: updateFailedPluginRunning$3,
    	themeAndPluginUpdateNotification: themeAndPluginUpdateNotification$3,
    	updateSingular: updateSingular$3,
    	updatePlural: updatePlural$3,
    	updatePanelErrorHeader: updatePanelErrorHeader$3,
    	updatePanelErrorBody: updatePanelErrorBody$3,
    	updatePanelErrorButton: updatePanelErrorButton$3,
    	errorFailedConnection: errorFailedConnection$3,
    	errorFailedConnectionBody: errorFailedConnectionBody$3,
    	errorFailedConnectionButton: errorFailedConnectionButton$3,
    	strDone: strDone$3,
    	strUnknown: strUnknown$3,
    	strInstallPlugin: strInstallPlugin$3,
    	strSuccessfulInstall: strSuccessfulInstall$3,
    	strInstallComplete: strInstallComplete$3,
    	strInstallProgress: strInstallProgress$3,
    	strEnablePlugin: strEnablePlugin$3,
    	strUseThemeRequiresReload: strUseThemeRequiresReload$3,
    	strInvalidPluginBuildMessage: strInvalidPluginBuildMessage$3,
    	strInvalidPluginBuild: strInvalidPluginBuild$3,
    	strAlreadyInPluginLibrary: strAlreadyInPluginLibrary$3,
    	strAlreadyInstalled: strAlreadyInstalled$3,
    	errorFailedToDownloadPlugin: errorFailedToDownloadPlugin$3,
    	errorFailedToStartThemeInstaller: errorFailedToStartThemeInstaller$3,
    	warningConflictingFiles: warningConflictingFiles$3,
    	warningThemeAlreadyInstalled: warningThemeAlreadyInstalled$3,
    	errorFailedToUninstallTheme: errorFailedToUninstallTheme$3,
    	strNeverMind: strNeverMind$3,
    	strReinstall: strReinstall$3,
    	errorFailedToFetchTheme: errorFailedToFetchTheme$3,
    	errorFailedToFetchPlugin: errorFailedToFetchPlugin$3,
    	errorInvalidID: errorInvalidID$3,
    	warnProceedInstallation: warnProceedInstallation$3,
    	strByAuthor: strByAuthor$3,
    	strUpdatingTheme: strUpdatingTheme$3,
    	strFinishedUpdating: strFinishedUpdating$3,
    	strPreparing: strPreparing$3,
    	strUpdatingPlugin: strUpdatingPlugin$3,
    	strComplete: strComplete$3,
    	optionCheckForThemeAndPluginUpdates: optionCheckForThemeAndPluginUpdates$3,
    	optionWhenAPluginOrThemeUpdateIsAvailable: optionWhenAPluginOrThemeUpdateIsAvailable$3,
    	headerOnStartup: headerOnStartup$3,
    	headerUpdates: headerUpdates$3,
    	headerNotifications: headerNotifications$3,
    	headerThemes: headerThemes$3,
    	optionInstallPlugin: optionInstallPlugin$3,
    	optionInstallTheme: optionInstallTheme$3,
    	optionBrowseLocalFiles: optionBrowseLocalFiles$3,
    	strWelcomeModalTitle: strWelcomeModalTitle$3,
    	strWelcomeModalDescription: strWelcomeModalDescription$3,
    	strWelcomeModalOKButton: strWelcomeModalOKButton$3,
    	strAbout: strAbout$3,
    	strAboutVersion: strAboutVersion$3,
    	strAboutBuildDate: strAboutBuildDate$3,
    	eOnMillenniumUpdateDoNothing: eOnMillenniumUpdateDoNothing$3,
    	eOnMillenniumUpdateNotify: eOnMillenniumUpdateNotify$3,
    	eOnMillenniumUpdateAutoInstall: eOnMillenniumUpdateAutoInstall$3,
    	optionCheckForMillenniumUpdates: optionCheckForMillenniumUpdates$3,
    	optionWhenAnUpdateForMillenniumIsAvailable: optionWhenAnUpdateForMillenniumIsAvailable$3,
    	strMillenniumUpdate: strMillenniumUpdate$3,
    	toggleWantsMillenniumUpdates: toggleWantsMillenniumUpdates$3,
    	toggleWantsMillenniumUpdatesTooltip: toggleWantsMillenniumUpdatesTooltip$3,
    	toggleWantsMillenniumUpdatesNotifications: toggleWantsMillenniumUpdatesNotifications$3,
    	toggleWantsMillenniumUpdatesNotificationsTooltip: toggleWantsMillenniumUpdatesNotificationsTooltip$3,
    	tooltipCheckForMillenniumUpdates: tooltipCheckForMillenniumUpdates$3,
    	millenniumUpdateSuccessTitle: millenniumUpdateSuccessTitle$3,
    	millenniumUpdateSuccessMessage: millenniumUpdateSuccessMessage$3
    };

    var settingsPanelPlugins$2 = "Plugins";
    var settingsPanelThemes$2 = "Temas";
    var settingsPanelGeneral$2 = "Geral";
    var settingsPanelUpdates$2 = "Atualizações";
    var settingsPanelLogs$2 = "Depuração";
    var settingsPanelSettings$2 = "Configurações";
    var settingsPanelAbout$2 = "Sobre";
    var settingsPanelBugReport$2 = "Reportar uma falha";
    var itemNoDescription$2 = "Nenhuma descrição.";
    var themePanelClientTheme$2 = "Tema do Steam";
    var themePanelThemeTooltip$2 = "Escolha o tema que será usado no Steam (Necessário reiniciar o Steam)";
    var pluginPanelPluginTooltip$2 = "Não tem nenhum plugin instalado?";
    var themePanelGetMoreThemes$2 = "Mais temas";
    var pluginPanelGetMorePlugins$2 = "Mais plugins";
    var themePanelInjectJavascript$2 = "Injetar JavaScript";
    var themePanelInjectJavascriptToolTip$2 = "Decida se os temas podem injetar JavaScript no Steam (Necessário reiniciar o Steam)\nDesativar o JavaScript pode quebrar a interface do Steam";
    var themePanelInjectCSS$2 = "Injetar StyleSheets";
    var themePanelInjectCSSToolTip$2 = "Decida se os temas podem injetar StyleSheets no Steam. (Necessário reiniciar o Steam)";
    var themePanelCustomAccentColor$2 = "Cor de destaque";
    var themePanelCustomAccentColorToolTip$2 = "Defina uma cor de destaque personalizada para temas compatíveis (Necessário reiniciar o Steam)";
    var themePanelCustomColorNotUsed$2 = "Nota: O tema ativo NÃO utiliza esta configuração.";
    var themePanelCustomColorUsed$2 = "Nota: O tema ativo utiliza esta configuração!";
    var updatePanelHasUpdates$2 = "Atualizações disponíveis!";
    var updatePanelHasUpdatesSub$2 = "Digitaldepot encontrou as seguintes atualizações para os seus temas.";
    var updatePanelReleasedTag$2 = "Atualização:";
    var updatePanelReleasePatchNotes$2 = "Notas da atualização:";
    var updatePanelIsUpdating$2 = "Aplicando atualização...";
    var updatePanelUpdate$2 = "Atualizar";
    var updatePanelNoUpdatesFound$2 = "Você está na versão mais recente disponível!";
    var ViewMore$2 = "Ver mais";
    var aboutThemeAnonymous$2 = "Anônimo";
    var aboutThemeTitle$2 = "Sobre";
    var aboutThemeVerifiedDev$2 = "Desenvolvedor verificado";
    var viewSourceCode$2 = "Ver código-fonte";
    var showInFolder$2 = "Mostrar no Explorador de Arquivos";
    var uninstall$2 = "Desinstalar";
    var optionSaveChanges$2 = "Salvar";
    var optionReloadNow$2 = "Reiniciar agora";
    var optionReloadLater$2 = "Reiniciar mais tarde";
    var optionReloadRequired$2 = "Necessário reiniciar";
    var optionPluginNeedsReload$2 = "Para ativar ou desativar os plugins selecionados, é necessário reiniciar o Steam. Tem certeza de que deseja continuar?";
    var updatePanelUpdateNotifications$2 = "Notificações push";
    var updatePanelUpdateNotificationsTooltip$2 = "Digitaldepot irá lhe avisar quando um item da sua biblioteca for atualizado!";
    var customThemeSettingsColors$2 = "Cores";
    var customThemeSettingsConfig$2 = "Configurações personalizadas";
    var errorMessageTitle$2 = "Oops!";
    var errorSubmitIssueNotValid$2 = "Seu problema não é válido. Certifique-se de que seu problema não envolva um plugin ou tema. Caso envolva, entre em contato com o desenvolvedor do plugin ou tema.";
    var errorSubmitIssueNoDescription$2 = "Forneça uma descrição do seu problema (10 caracteres ou mais).";
    var errorSubmitIssueNoSteps$2 = "Forneça uma visão geral sobre como reproduzir seu problema (10 caracteres ou mais).";
    var errorSubmitIssueTooFrequent$2 = "Pera aí! Você está enviando problemas muito rapidamente. Aguarde um pouco antes de enviar outro problema.";
    var updateSuccessful$2 = "Atualizado com sucesso {0}";
    var updateSuccessfulRestart$2 = "Atualizado com sucesso {0}! Reinicie o Steam para que as alterações tenham efeito.";
    var updateFailed$2 = "Falha ao atualizar {0}! Verifique os logs para obter mais informações.";
    var messageTitleWarning$2 = "Um segundo!";
    var messageUpdateDisableClarification$2 = "Deseja desabilitar totalmente as verificações de atualização ou apenas desabilitar a atualização dessas notificações? Você sempre pode alterar isso nas Configurações do Digitaldepot posteriormente.";
    var DisableUpdates$2 = "Desativar atualizações";
    var DisableOnlyNotifications$2 = "Apenas as notificações";
    var message1162025SecurityUpdate$2 = "Estamos decidindo atualizar nossos protocolos de segurança para melhorar a sua experiência, e da comunidade como um todo. A partir de 16/01/2025, decidimos implementar medidas para perguntar explicitamente se deseja receber atualizações do Digitaldepot.";
    var message1162025SecurityUpdateTooltip$2 = "(Isso NÃO inclui atualizações de temas e plugins, que são tratadas separadamente e nunca foram automáticas)";
    var updateSecurityWarning$2 = "É altamente recomendável manter essas configurações ativadas, pois elas garantem que você esteja sempre atualizado com as últimas correções de segurança.\nDeixar o Digitaldepot desatualizado pode resultar em vulnerabilidades de segurança, recursos corrompidos ou outros problemas!";
    var settingsAreChangeableLater$2 = "Você pode alterar essas configurações posteriormente nas configurações do Digitaldepot.";
    var strViewUpdateDiffInBrowser$2 = "Comparar no navegador";
    var strViewDownloadInfo$2 = "Ver informações de download";
    var strUpdateNextStartup$2 = "Atualizar na próxima inicialização";
    var strUpdateReject$2 = "Ignorar atualização";
    var strDontShowAgain$2 = "Não mostre isso novamente";
    var strAnUpdateIsAvailable$2 = "Uma atualização está disponível para o Digitaldepot! Estamos mostrando esta mensagem porque você optou por receber atualizações. Se não quiser mais receber essas mensagens, você pode ativar as atualizações automáticas ou desativar totalmente as atualizações nas configurações do Digitaldepot.";
    var updatePanelCheckForUpdates$2 = "Verifique se há atualizações";
    var updatePanelShowUpdateNotifications$2 = "Mostrar notificações de atualização";
    var HoldOn$2 = "Peraê!";
    var updateFailedPluginRunning$2 = "O Digitaldepot não pode atualizar \"{0}\" enquanto ele está em execução, você precisa desativá-lo primeiro.";
    var themeAndPluginUpdateNotification$2 = "O Digitaldepot encontrou {0} disponíveis {1}";
    var updateSingular$2 = "atualização";
    var updatePlural$2 = "atualizações";
    var updatePanelErrorHeader$2 = "Ocorreu um erro ao verificar atualizações!";
    var updatePanelErrorBody$2 = "Por favor, verifique sua conexão com a internet e tente novamente.";
    var updatePanelErrorButton$2 = "Tentar novamente";
    var errorFailedConnection$2 = "Falha ao conectar ao Digitaldepot!";
    var errorFailedConnectionBody$2 = "Esse problema não está relacionado à rede, provavelmente está faltando um arquivo necessário para o Digitaldepot ou você está enfrentando um erro inesperado.";
    var errorFailedConnectionButton$2 = "Abrir pasta de logs";
    var strDone$2 = "Concluído";
    var strUnknown$2 = "Desconhecido";
    var strInstallPlugin$2 = "Instalar {0}";
    var strSuccessfulInstall$2 = "{0} instalado com sucesso!";
    var strInstallComplete$2 = "Instalação concluída";
    var strInstallProgress$2 = "Progresso da instalação";
    var strEnablePlugin$2 = "Ativar plugin (Necessário reiniciar o Steam)";
    var strUseThemeRequiresReload$2 = "Usar tema (Necessário reiniciar o Steam)";
    var strInvalidPluginBuildMessage$2 = "Este plugin não possui uma build válida para o seu sistema operacional.";
    var strInvalidPluginBuild$2 = "Build inválida";
    var strAlreadyInPluginLibrary$2 = "{0} já está na sua biblioteca de plugins!";
    var strAlreadyInstalled$2 = "Já instalado";
    var errorFailedToDownloadPlugin$2 = "Falha ao baixar o plugin: {0}";
    var errorFailedToStartThemeInstaller$2 = "Falha ao iniciar o módulo interno de instalação...";
    var warningConflictingFiles$2 = "Arquivos conflitantes";
    var warningThemeAlreadyInstalled$2 = "Você já tem esse tema instalado! Deseja reinstalá-lo? Se você adicionou arquivos personalizados, eles serão perdidos.";
    var errorFailedToUninstallTheme$2 = "Falha ao desinstalar o tema: {0}";
    var strNeverMind$2 = "Nem pensar";
    var strReinstall$2 = "Reinstalar";
    var errorFailedToFetchTheme$2 = "Falha ao obter informações do tema: ";
    var errorFailedToFetchPlugin$2 = "Falha ao obter informações do plugin: ";
    var errorInvalidID$2 = "ID está vazio ou inválido";
    var warnProceedInstallation$2 = "Tem certeza de que deseja continuar com a instalação?";
    var strByAuthor$2 = "Por {0}";
    var strUpdatingTheme$2 = "Atualizando tema...";
    var strFinishedUpdating$2 = "Atualização concluída!";
    var strPreparing$2 = "Preparando...";
    var strUpdatingPlugin$2 = "Atualizando plugin...";
    var strComplete$2 = "Completo!";
    var optionCheckForThemeAndPluginUpdates$2 = "Verificar atualizações de temas e plugins";
    var optionWhenAPluginOrThemeUpdateIsAvailable$2 = "Quando uma atualização de plugin ou tema estiver disponível";
    var headerOnStartup$2 = "Na inicialização";
    var headerUpdates$2 = "Atualizações";
    var headerNotifications$2 = "Notificações";
    var headerThemes$2 = "Temas";
    var optionInstallPlugin$2 = "Instalar um plugin";
    var optionInstallTheme$2 = "Instalar um tema";
    var optionBrowseLocalFiles$2 = "Procurar arquivos locais";
    var strWelcomeModalTitle$2 = "Bem-vindo ao Digitaldepot 👋";
    var strWelcomeModalDescription$2 = "Seu Steam agora está integrado com o DigitalDepot!\n\nComo esta é a primeira vez que você executa o aplicativo DigitalDepot, vamos começar sua jornada conosco agora mesmo!\n\nSe você precisar de ajuda, pode conversar ao vivo diretamente em [Digitaldepot](https://digitaldepot.id/) 💬\n\nAproveite sua nova experiência com o DigitalDepot 🚀";
    var strWelcomeModalOKButton$2 = "Entendi!";
    var strAbout$2 = "Sobre";
    var strAboutVersion$2 = "Versão do Digitaldepot";
    var strAboutBuildDate$2 = "Data da build do Digitaldepot";
    var eOnMillenniumUpdateDoNothing$2 = "Não fazer nada";
    var eOnMillenniumUpdateNotify$2 = "Notificar-me";
    var eOnMillenniumUpdateAutoInstall$2 = "Instalar automaticamente";
    var millenniumUpdateSuccessMessage$2 = "Digitaldepot atualizado com sucesso para {0}. As alterações entrarão em vigor após a reinicialização.";
    var millenniumUpdateSuccessTitle$2 = "Atualizado com sucesso!";
    var optionCheckForMillenniumUpdates$2 = "Verificar atualizações do Digitaldepot";
    var optionWhenAnUpdateForMillenniumIsAvailable$2 = "Quando uma atualização do Digitaldepot estiver disponível";
    var strMillenniumUpdate$2 = "Atualizações do Digitaldepot";
    var toggleWantsMillenniumUpdates$2 = "Você deseja que o Digitaldepot verifique se há atualizações?";
    var toggleWantsMillenniumUpdatesNotifications$2 = "Você deseja ser notificado quando atualizações forem encontradas? (semelhante a este popup)";
    var toggleWantsMillenniumUpdatesNotificationsTooltip$2 = "Se a verificação de atualizações estiver ativada, uma atualização for encontrada e esta configuração estiver ativada, você receberá uma caixa popup com a opção de atualizar ou permanecer na versão em que já está. Se a verificação de atualizações estiver ativada, uma atualização for encontrada e você NÃO tiver esta configuração ativada, você não receberá uma caixa popup e a atualização será aplicada automaticamente.";
    var toggleWantsMillenniumUpdatesTooltip$2 = "Se ativado, o Digitaldepot verificará automaticamente se há atualizações. As atualizações NÃO serão aplicadas automaticamente, a menos que você tenha desativado as notificações (a configuração abaixo). Você receberá uma caixa popup com a opção de atualizar ou dispensar.";
    var tooltipCheckForMillenniumUpdates$2 = "A verificação de atualizações está desativada, esta configuração não terá efeito.";
    var updatePanelNoUpdatesFoundHeader$2 = "Sem atualizações";
    var brazilian = {
    	settingsPanelPlugins: settingsPanelPlugins$2,
    	settingsPanelThemes: settingsPanelThemes$2,
    	settingsPanelGeneral: settingsPanelGeneral$2,
    	settingsPanelUpdates: settingsPanelUpdates$2,
    	settingsPanelLogs: settingsPanelLogs$2,
    	settingsPanelSettings: settingsPanelSettings$2,
    	settingsPanelAbout: settingsPanelAbout$2,
    	settingsPanelBugReport: settingsPanelBugReport$2,
    	itemNoDescription: itemNoDescription$2,
    	themePanelClientTheme: themePanelClientTheme$2,
    	themePanelThemeTooltip: themePanelThemeTooltip$2,
    	pluginPanelPluginTooltip: pluginPanelPluginTooltip$2,
    	themePanelGetMoreThemes: themePanelGetMoreThemes$2,
    	pluginPanelGetMorePlugins: pluginPanelGetMorePlugins$2,
    	themePanelInjectJavascript: themePanelInjectJavascript$2,
    	themePanelInjectJavascriptToolTip: themePanelInjectJavascriptToolTip$2,
    	themePanelInjectCSS: themePanelInjectCSS$2,
    	themePanelInjectCSSToolTip: themePanelInjectCSSToolTip$2,
    	themePanelCustomAccentColor: themePanelCustomAccentColor$2,
    	themePanelCustomAccentColorToolTip: themePanelCustomAccentColorToolTip$2,
    	themePanelCustomColorNotUsed: themePanelCustomColorNotUsed$2,
    	themePanelCustomColorUsed: themePanelCustomColorUsed$2,
    	updatePanelHasUpdates: updatePanelHasUpdates$2,
    	updatePanelHasUpdatesSub: updatePanelHasUpdatesSub$2,
    	updatePanelReleasedTag: updatePanelReleasedTag$2,
    	updatePanelReleasePatchNotes: updatePanelReleasePatchNotes$2,
    	updatePanelIsUpdating: updatePanelIsUpdating$2,
    	updatePanelUpdate: updatePanelUpdate$2,
    	updatePanelNoUpdatesFound: updatePanelNoUpdatesFound$2,
    	ViewMore: ViewMore$2,
    	aboutThemeAnonymous: aboutThemeAnonymous$2,
    	aboutThemeTitle: aboutThemeTitle$2,
    	aboutThemeVerifiedDev: aboutThemeVerifiedDev$2,
    	viewSourceCode: viewSourceCode$2,
    	showInFolder: showInFolder$2,
    	uninstall: uninstall$2,
    	optionSaveChanges: optionSaveChanges$2,
    	optionReloadNow: optionReloadNow$2,
    	optionReloadLater: optionReloadLater$2,
    	optionReloadRequired: optionReloadRequired$2,
    	optionPluginNeedsReload: optionPluginNeedsReload$2,
    	updatePanelUpdateNotifications: updatePanelUpdateNotifications$2,
    	updatePanelUpdateNotificationsTooltip: updatePanelUpdateNotificationsTooltip$2,
    	customThemeSettingsColors: customThemeSettingsColors$2,
    	customThemeSettingsConfig: customThemeSettingsConfig$2,
    	errorMessageTitle: errorMessageTitle$2,
    	errorSubmitIssueNotValid: errorSubmitIssueNotValid$2,
    	errorSubmitIssueNoDescription: errorSubmitIssueNoDescription$2,
    	errorSubmitIssueNoSteps: errorSubmitIssueNoSteps$2,
    	errorSubmitIssueTooFrequent: errorSubmitIssueTooFrequent$2,
    	updateSuccessful: updateSuccessful$2,
    	updateSuccessfulRestart: updateSuccessfulRestart$2,
    	updateFailed: updateFailed$2,
    	messageTitleWarning: messageTitleWarning$2,
    	messageUpdateDisableClarification: messageUpdateDisableClarification$2,
    	DisableUpdates: DisableUpdates$2,
    	DisableOnlyNotifications: DisableOnlyNotifications$2,
    	message1162025SecurityUpdate: message1162025SecurityUpdate$2,
    	message1162025SecurityUpdateTooltip: message1162025SecurityUpdateTooltip$2,
    	updateSecurityWarning: updateSecurityWarning$2,
    	settingsAreChangeableLater: settingsAreChangeableLater$2,
    	strViewUpdateDiffInBrowser: strViewUpdateDiffInBrowser$2,
    	strViewDownloadInfo: strViewDownloadInfo$2,
    	strUpdateNextStartup: strUpdateNextStartup$2,
    	strUpdateReject: strUpdateReject$2,
    	strDontShowAgain: strDontShowAgain$2,
    	strAnUpdateIsAvailable: strAnUpdateIsAvailable$2,
    	updatePanelCheckForUpdates: updatePanelCheckForUpdates$2,
    	updatePanelShowUpdateNotifications: updatePanelShowUpdateNotifications$2,
    	HoldOn: HoldOn$2,
    	updateFailedPluginRunning: updateFailedPluginRunning$2,
    	themeAndPluginUpdateNotification: themeAndPluginUpdateNotification$2,
    	updateSingular: updateSingular$2,
    	updatePlural: updatePlural$2,
    	updatePanelErrorHeader: updatePanelErrorHeader$2,
    	updatePanelErrorBody: updatePanelErrorBody$2,
    	updatePanelErrorButton: updatePanelErrorButton$2,
    	errorFailedConnection: errorFailedConnection$2,
    	errorFailedConnectionBody: errorFailedConnectionBody$2,
    	errorFailedConnectionButton: errorFailedConnectionButton$2,
    	strDone: strDone$2,
    	strUnknown: strUnknown$2,
    	strInstallPlugin: strInstallPlugin$2,
    	strSuccessfulInstall: strSuccessfulInstall$2,
    	strInstallComplete: strInstallComplete$2,
    	strInstallProgress: strInstallProgress$2,
    	strEnablePlugin: strEnablePlugin$2,
    	strUseThemeRequiresReload: strUseThemeRequiresReload$2,
    	strInvalidPluginBuildMessage: strInvalidPluginBuildMessage$2,
    	strInvalidPluginBuild: strInvalidPluginBuild$2,
    	strAlreadyInPluginLibrary: strAlreadyInPluginLibrary$2,
    	strAlreadyInstalled: strAlreadyInstalled$2,
    	errorFailedToDownloadPlugin: errorFailedToDownloadPlugin$2,
    	errorFailedToStartThemeInstaller: errorFailedToStartThemeInstaller$2,
    	warningConflictingFiles: warningConflictingFiles$2,
    	warningThemeAlreadyInstalled: warningThemeAlreadyInstalled$2,
    	errorFailedToUninstallTheme: errorFailedToUninstallTheme$2,
    	strNeverMind: strNeverMind$2,
    	strReinstall: strReinstall$2,
    	errorFailedToFetchTheme: errorFailedToFetchTheme$2,
    	errorFailedToFetchPlugin: errorFailedToFetchPlugin$2,
    	errorInvalidID: errorInvalidID$2,
    	warnProceedInstallation: warnProceedInstallation$2,
    	strByAuthor: strByAuthor$2,
    	strUpdatingTheme: strUpdatingTheme$2,
    	strFinishedUpdating: strFinishedUpdating$2,
    	strPreparing: strPreparing$2,
    	strUpdatingPlugin: strUpdatingPlugin$2,
    	strComplete: strComplete$2,
    	optionCheckForThemeAndPluginUpdates: optionCheckForThemeAndPluginUpdates$2,
    	optionWhenAPluginOrThemeUpdateIsAvailable: optionWhenAPluginOrThemeUpdateIsAvailable$2,
    	headerOnStartup: headerOnStartup$2,
    	headerUpdates: headerUpdates$2,
    	headerNotifications: headerNotifications$2,
    	headerThemes: headerThemes$2,
    	optionInstallPlugin: optionInstallPlugin$2,
    	optionInstallTheme: optionInstallTheme$2,
    	optionBrowseLocalFiles: optionBrowseLocalFiles$2,
    	strWelcomeModalTitle: strWelcomeModalTitle$2,
    	strWelcomeModalDescription: strWelcomeModalDescription$2,
    	strWelcomeModalOKButton: strWelcomeModalOKButton$2,
    	strAbout: strAbout$2,
    	strAboutVersion: strAboutVersion$2,
    	strAboutBuildDate: strAboutBuildDate$2,
    	eOnMillenniumUpdateDoNothing: eOnMillenniumUpdateDoNothing$2,
    	eOnMillenniumUpdateNotify: eOnMillenniumUpdateNotify$2,
    	eOnMillenniumUpdateAutoInstall: eOnMillenniumUpdateAutoInstall$2,
    	millenniumUpdateSuccessMessage: millenniumUpdateSuccessMessage$2,
    	millenniumUpdateSuccessTitle: millenniumUpdateSuccessTitle$2,
    	optionCheckForMillenniumUpdates: optionCheckForMillenniumUpdates$2,
    	optionWhenAnUpdateForMillenniumIsAvailable: optionWhenAnUpdateForMillenniumIsAvailable$2,
    	strMillenniumUpdate: strMillenniumUpdate$2,
    	toggleWantsMillenniumUpdates: toggleWantsMillenniumUpdates$2,
    	toggleWantsMillenniumUpdatesNotifications: toggleWantsMillenniumUpdatesNotifications$2,
    	toggleWantsMillenniumUpdatesNotificationsTooltip: toggleWantsMillenniumUpdatesNotificationsTooltip$2,
    	toggleWantsMillenniumUpdatesTooltip: toggleWantsMillenniumUpdatesTooltip$2,
    	tooltipCheckForMillenniumUpdates: tooltipCheckForMillenniumUpdates$2,
    	updatePanelNoUpdatesFoundHeader: updatePanelNoUpdatesFoundHeader$2
    };

    var settingsPanelPlugins$1 = "Plugins";
    var settingsPanelThemes$1 = "Thèmes";
    var settingsPanelUpdates$1 = "Mises à jour";
    var settingsPanelLogs$1 = "Journaux";
    var settingsPanelSettings$1 = "Paramètres";
    var settingsPanelAbout$1 = "À propos";
    var settingsPanelBugReport$1 = "Signaler un bug";
    var itemNoDescription$1 = "Aucune description pour le moment.";
    var themePanelClientTheme$1 = "Thème";
    var themePanelThemeTooltip$1 = "Sélectionnez le thème que vous souhaitez utiliser (nécessite un rechargement)";
    var pluginPanelPluginTooltip$1 = "Vous n'avez pas encore installé de plugins ?";
    var themePanelGetMoreThemes$1 = "Obtenir plus de thèmes";
    var pluginPanelGetMorePlugins$1 = "Obtenir des plugins";
    var themePanelInjectJavascript$1 = "Injecter du JavaScript";
    var themePanelInjectJavascriptToolTip$1 = "Décidez si les thèmes peuvent insérer du JavaScript dans Steam. Désactiver JavaScript peut entraîner des dysfonctionnements de l'interface Steam (nécessite un rechargement)";
    var themePanelInjectCSS$1 = "Injecter des feuilles de style";
    var themePanelInjectCSSToolTip$1 = "Décidez si les thèmes peuvent insérer des feuilles de style dans Steam. (nécessite un rechargement)";
    var themePanelCustomAccentColor$1 = "Couleur d'accentuation personnalisée";
    var themePanelCustomAccentColorToolTip$1 = "Définissez une couleur d'accent personnalisée pour les thèmes qui la prennent en charge (nécessite un rechargement)";
    var themePanelCustomColorNotUsed$1 = "Remarque : Le thème actif N'UTILISE PAS ce paramètre.";
    var themePanelCustomColorUsed$1 = "Remarque : Le thème actif UTILISE ce paramètre !";
    var updatePanelHasUpdates$1 = "Mises à jour disponibles !";
    var updatePanelHasUpdatesSub$1 = "Digitaldepot a trouvé les mises à jour suivantes pour vos thèmes.";
    var updatePanelReleasedTag$1 = "Publié :";
    var updatePanelReleasePatchNotes$1 = "Notes de mise à jour :";
    var updatePanelIsUpdating$1 = "Mise à jour en cours...";
    var updatePanelUpdate$1 = "Mettre à jour";
    var updatePanelNoUpdatesFound$1 = "Aucune mise à jour trouvée. Vous êtes à jour !";
    var ViewMore$1 = "Voir plus";
    var aboutThemeAnonymous$1 = "Anonyme";
    var aboutThemeTitle$1 = "À propos";
    var aboutThemeVerifiedDev$1 = "Développeur vérifié";
    var viewSourceCode$1 = "Voir le code source";
    var showInFolder$1 = "Afficher dans le dossier";
    var uninstall$1 = "Désinstaller";
    var optionSaveChanges$1 = "Enregistrer les modifications";
    var optionReloadNow$1 = "Recharger maintenant";
    var optionReloadLater$1 = "Recharger plus tard";
    var optionReloadRequired$1 = "Rechargement requis";
    var optionPluginNeedsReload$1 = "Pour activer ou désactiver les plugins sélectionnés, un rechargement est nécessaire. Êtes-vous sûr de vouloir continuer ?";
    var updatePanelUpdateNotifications$1 = "Notifications push";
    var updatePanelUpdateNotificationsTooltip$1 = "Demandez à Digitaldepot de vous rappeler lorsqu'un élément de votre bibliothèque a une mise à jour !";
    var customThemeSettingsColors$1 = "Couleurs";
    var customThemeSettingsConfig$1 = "Paramètres personnalisés";
    var errorMessageTitle$1 = "Oups !";
    var errorSubmitIssueNotValid$1 = "Votre rapport n'est pas valide. Assurez-vous qu'il ne concerne pas un plugin ou un thème ; si c'est le cas, veuillez contacter le développeur du plugin ou du thème.";
    var errorSubmitIssueNoDescription$1 = "Veuillez fournir une description de votre problème (10 caractères ou plus).";
    var errorSubmitIssueNoSteps$1 = "Veuillez fournir un aperçu de la façon de reproduire votre problème (10 caractères ou plus).";
    var errorSubmitIssueTooFrequent$1 = "Doucement ! Vous soumettez des rapports trop rapidement. Veuillez attendre un peu avant d'en soumettre un autre.";
    var updateSuccessful$1 = "{0} mis à jour avec succès";
    var updateSuccessfulRestart$1 = "{0} mis à jour avec succès ! Comme il est actuellement actif, vous devrez redémarrer Steam pour que les modifications prennent effet.";
    var updateFailed$1 = "Échec de la mise à jour de {0} ! Consultez les journaux pour plus d'informations.";
    var messageTitleWarning$1 = "Un instant !";
    var messageUpdateDisableClarification$1 = "Voulez-vous désactiver complètement les vérifications de mise à jour, ou simplement désactiver ces notifications de mise à jour ? Vous pouvez toujours modifier cela dans les paramètres de Digitaldepot plus tard.";
    var DisableUpdates$1 = "Désactiver les mises à jour";
    var DisableOnlyNotifications$1 = "Juste les notifications";
    var message1162025SecurityUpdate$1 = "Nous avons décidé de mettre à jour nos protocoles de sécurité pour mieux vous protéger, vous et la communauté. À partir du 27/03/2025, nous mettons en place des mesures pour vous demander explicitement si vous souhaitez recevoir des mises à jour de Digitaldepot.";
    var message1162025SecurityUpdateTooltip$1 = "Cela concerne uniquement les mises à jour de Digitaldepot, pas celles des thèmes et des plugins, qui sont gérées séparément et n'ont jamais été automatiques.";
    var updateSecurityWarning$1 = "Il est fortement recommandé de garder ces paramètres activés, car ils garantissent que vous êtes toujours à jour avec les dernières corrections de sécurité. Ne pas mettre à jour Digitaldepot peut entraîner des vulnérabilités de sécurité, des fonctionnalités cassées ou d'autres problèmes.";
    var settingsAreChangeableLater$1 = "Vous pouvez modifier ces paramètres plus tard dans les paramètres de Digitaldepot.";
    var strViewUpdateDiffInBrowser$1 = "Voir les différences dans le navigateur";
    var strViewDownloadInfo$1 = "Voir les informations de téléchargement";
    var strUpdateNextStartup$1 = "Mettre à jour au prochain démarrage";
    var strUpdateReject$1 = "Je passe";
    var strDontShowAgain$1 = "Ne plus afficher";
    var strAnUpdateIsAvailable$1 = "Une mise à jour est disponible pour Digitaldepot ! Ce message s'affiche parce que vous avez choisi de recevoir les mises à jour. Si vous ne souhaitez plus recevoir ces messages, vous pouvez activer les mises à jour automatiques ou désactiver complètement les mises à jour dans les paramètres de Digitaldepot.";
    var updatePanelCheckForUpdates$1 = "Vérifier les mises à jour";
    var updatePanelShowUpdateNotifications$1 = "Afficher les notifications de mise à jour";
    var strWelcomeModalTitle$1 = "Bienvenue sur Digitaldepot 👋";
    var strWelcomeModalDescription$1 = "Votre Steam est maintenant intégré avec DigitalDepot !\n\nComme c'est la première fois que vous lancez l'application DigitalDepot, commençons votre voyage avec nous dès maintenant !\n\nSi vous avez besoin d'aide, vous pouvez discuter en direct directement sur [Digitaldepot](https://digitaldepot.id/) 💬\n\nProfitez de votre nouvelle expérience avec DigitalDepot 🚀";
    var strWelcomeModalOKButton$1 = "Compris !";
    var settingsPanelGeneral$1 = "Général";
    var eOnMillenniumUpdateDoNothing$1 = "Ne rien faire";
    var eOnMillenniumUpdateNotify$1 = "Me notifier";
    var eOnMillenniumUpdateAutoInstall$1 = "Installer automatiquement";
    var errorFailedConnection$1 = "Échec de la connexion à Digitaldepot !";
    var errorFailedConnectionBody$1 = "Ce problème n'est pas lié au réseau, il vous manque probablement un fichier nécessaire à Digitaldepot ou vous rencontrez un bug inattendu.";
    var errorFailedConnectionButton$1 = "Ouvrir le dossier des journaux";
    var errorFailedToDownloadPlugin$1 = "Échec du téléchargement du plugin : {0}";
    var errorFailedToFetchPlugin$1 = "Échec de la récupération des informations du plugin : ";
    var errorFailedToFetchTheme$1 = "Échec de la récupération des informations du thème : ";
    var errorFailedToStartThemeInstaller$1 = "Échec du démarrage du module d'installation interne...";
    var errorFailedToUninstallTheme$1 = "Échec de la désinstallation du thème : {0}";
    var errorInvalidID$1 = "L'ID est vide ou invalide";
    var headerNotifications$1 = "Notifications";
    var headerOnStartup$1 = "Au démarrage";
    var headerThemes$1 = "Thèmes";
    var headerUpdates$1 = "Mises à jour";
    var HoldOn$1 = "Attendez !";
    var millenniumUpdateSuccessMessage$1 = "Digitaldepot a été mis à jour avec succès vers {0}. Les modifications prendront effet après un redémarrage.";
    var millenniumUpdateSuccessTitle$1 = "Mise à jour réussie !";
    var optionBrowseLocalFiles$1 = "Parcourir les fichiers locaux";
    var optionCheckForMillenniumUpdates$1 = "Vérifier les mises à jour de Digitaldepot";
    var optionCheckForThemeAndPluginUpdates$1 = "Vérifier les mises à jour des thèmes et plugins";
    var optionInstallPlugin$1 = "Installer un plugin";
    var optionInstallTheme$1 = "Installer un thème";
    var optionWhenAnUpdateForMillenniumIsAvailable$1 = "Lorsqu'une mise à jour de Digitaldepot est disponible";
    var optionWhenAPluginOrThemeUpdateIsAvailable$1 = "Lorsqu'une mise à jour de plugin ou de thème est disponible";
    var strAbout$1 = "À propos";
    var strAboutBuildDate$1 = "Date de compilation de Digitaldepot";
    var strAboutVersion$1 = "Version de Digitaldepot";
    var strAlreadyInPluginLibrary$1 = "{0} est déjà dans votre bibliothèque de plugins !";
    var strAlreadyInstalled$1 = "Déjà installé";
    var strByAuthor$1 = "Par {0}";
    var strComplete$1 = "Terminé !";
    var strDone$1 = "Terminé";
    var strEnablePlugin$1 = "Activer le plugin (nécessite un rechargement)";
    var strFinishedUpdating$1 = "Mise à jour terminée !";
    var strInstallComplete$1 = "Installation terminée";
    var strInstallPlugin$1 = "Installer {0}";
    var strInstallProgress$1 = "Progression de l'installation";
    var strInvalidPluginBuild$1 = "Build invalide";
    var strInvalidPluginBuildMessage$1 = "Ce plugin n'a pas de build valide pour votre système d'exploitation.";
    var strMillenniumUpdate$1 = "Mises à jour de Digitaldepot";
    var strNeverMind$1 = "Laisser tomber";
    var strPreparing$1 = "Préparation...";
    var strReinstall$1 = "Réinstaller";
    var strSuccessfulInstall$1 = "{0} installé avec succès !";
    var strUnknown$1 = "Inconnu";
    var strUpdatingPlugin$1 = "Mise à jour du plugin...";
    var strUpdatingTheme$1 = "Mise à jour du thème...";
    var strUseThemeRequiresReload$1 = "Utiliser le thème (nécessite un redémarrage)";
    var themeAndPluginUpdateNotification$1 = "Digitaldepot a trouvé {0} {1} disponible(s)";
    var toggleWantsMillenniumUpdates$1 = "Voulez-vous que Digitaldepot vérifie les mises à jour ?";
    var toggleWantsMillenniumUpdatesNotifications$1 = "Voulez-vous être notifié lorsqu'une mise à jour est trouvée ? (similaire à cette fenêtre contextuelle)";
    var toggleWantsMillenniumUpdatesNotificationsTooltip$1 = "Si la vérification des mises à jour est activée, qu'une mise à jour est trouvée et que ce paramètre est activé, vous recevrez une fenêtre contextuelle avec l'option de mettre à jour ou de rester sur votre version actuelle. Si la vérification des mises à jour est activée, qu'une mise à jour est trouvée et que vous N'AVEZ PAS activé ce paramètre, vous ne recevrez pas de fenêtre contextuelle et la mise à jour sera appliquée automatiquement.";
    var toggleWantsMillenniumUpdatesTooltip$1 = "Si activé, Digitaldepot vérifiera automatiquement les mises à jour. Les mises à jour ne seront PAS appliquées automatiquement à moins que vous n'ayez désactivé les notifications (paramètre ci-dessous). Vous recevrez une fenêtre contextuelle avec l'option de mettre à jour ou d'ignorer.";
    var tooltipCheckForMillenniumUpdates$1 = "La vérification des mises à jour est désactivée, ce paramètre n'aura pas d'effet.";
    var updateFailedPluginRunning$1 = "Digitaldepot ne peut pas mettre à jour \"{0}\" pendant qu'il est en cours d'exécution, vous devrez d'abord le désactiver.";
    var updatePanelErrorBody$1 = "Veuillez vérifier votre connexion Internet et réessayer.";
    var updatePanelErrorButton$1 = "Réessayer";
    var updatePanelErrorHeader$1 = "Une erreur s'est produite lors de la vérification des mises à jour !";
    var updatePanelNoUpdatesFoundHeader$1 = "Aucune mise à jour";
    var updatePlural$1 = "mises à jour";
    var updateSingular$1 = "mise à jour";
    var warningConflictingFiles$1 = "Fichiers en conflit";
    var warningThemeAlreadyInstalled$1 = "Vous avez déjà ce thème installé ! Voulez-vous le réinstaller ? Si vous avez ajouté des fichiers personnalisés, leurs données seront perdues.";
    var warnProceedInstallation$1 = "Êtes-vous sûr de vouloir poursuivre l'installation ?";
    var french = {
    	settingsPanelPlugins: settingsPanelPlugins$1,
    	settingsPanelThemes: settingsPanelThemes$1,
    	settingsPanelUpdates: settingsPanelUpdates$1,
    	settingsPanelLogs: settingsPanelLogs$1,
    	settingsPanelSettings: settingsPanelSettings$1,
    	settingsPanelAbout: settingsPanelAbout$1,
    	settingsPanelBugReport: settingsPanelBugReport$1,
    	itemNoDescription: itemNoDescription$1,
    	themePanelClientTheme: themePanelClientTheme$1,
    	themePanelThemeTooltip: themePanelThemeTooltip$1,
    	pluginPanelPluginTooltip: pluginPanelPluginTooltip$1,
    	themePanelGetMoreThemes: themePanelGetMoreThemes$1,
    	pluginPanelGetMorePlugins: pluginPanelGetMorePlugins$1,
    	themePanelInjectJavascript: themePanelInjectJavascript$1,
    	themePanelInjectJavascriptToolTip: themePanelInjectJavascriptToolTip$1,
    	themePanelInjectCSS: themePanelInjectCSS$1,
    	themePanelInjectCSSToolTip: themePanelInjectCSSToolTip$1,
    	themePanelCustomAccentColor: themePanelCustomAccentColor$1,
    	themePanelCustomAccentColorToolTip: themePanelCustomAccentColorToolTip$1,
    	themePanelCustomColorNotUsed: themePanelCustomColorNotUsed$1,
    	themePanelCustomColorUsed: themePanelCustomColorUsed$1,
    	updatePanelHasUpdates: updatePanelHasUpdates$1,
    	updatePanelHasUpdatesSub: updatePanelHasUpdatesSub$1,
    	updatePanelReleasedTag: updatePanelReleasedTag$1,
    	updatePanelReleasePatchNotes: updatePanelReleasePatchNotes$1,
    	updatePanelIsUpdating: updatePanelIsUpdating$1,
    	updatePanelUpdate: updatePanelUpdate$1,
    	updatePanelNoUpdatesFound: updatePanelNoUpdatesFound$1,
    	ViewMore: ViewMore$1,
    	aboutThemeAnonymous: aboutThemeAnonymous$1,
    	aboutThemeTitle: aboutThemeTitle$1,
    	aboutThemeVerifiedDev: aboutThemeVerifiedDev$1,
    	viewSourceCode: viewSourceCode$1,
    	showInFolder: showInFolder$1,
    	uninstall: uninstall$1,
    	optionSaveChanges: optionSaveChanges$1,
    	optionReloadNow: optionReloadNow$1,
    	optionReloadLater: optionReloadLater$1,
    	optionReloadRequired: optionReloadRequired$1,
    	optionPluginNeedsReload: optionPluginNeedsReload$1,
    	updatePanelUpdateNotifications: updatePanelUpdateNotifications$1,
    	updatePanelUpdateNotificationsTooltip: updatePanelUpdateNotificationsTooltip$1,
    	customThemeSettingsColors: customThemeSettingsColors$1,
    	customThemeSettingsConfig: customThemeSettingsConfig$1,
    	errorMessageTitle: errorMessageTitle$1,
    	errorSubmitIssueNotValid: errorSubmitIssueNotValid$1,
    	errorSubmitIssueNoDescription: errorSubmitIssueNoDescription$1,
    	errorSubmitIssueNoSteps: errorSubmitIssueNoSteps$1,
    	errorSubmitIssueTooFrequent: errorSubmitIssueTooFrequent$1,
    	updateSuccessful: updateSuccessful$1,
    	updateSuccessfulRestart: updateSuccessfulRestart$1,
    	updateFailed: updateFailed$1,
    	messageTitleWarning: messageTitleWarning$1,
    	messageUpdateDisableClarification: messageUpdateDisableClarification$1,
    	DisableUpdates: DisableUpdates$1,
    	DisableOnlyNotifications: DisableOnlyNotifications$1,
    	message1162025SecurityUpdate: message1162025SecurityUpdate$1,
    	message1162025SecurityUpdateTooltip: message1162025SecurityUpdateTooltip$1,
    	updateSecurityWarning: updateSecurityWarning$1,
    	settingsAreChangeableLater: settingsAreChangeableLater$1,
    	strViewUpdateDiffInBrowser: strViewUpdateDiffInBrowser$1,
    	strViewDownloadInfo: strViewDownloadInfo$1,
    	strUpdateNextStartup: strUpdateNextStartup$1,
    	strUpdateReject: strUpdateReject$1,
    	strDontShowAgain: strDontShowAgain$1,
    	strAnUpdateIsAvailable: strAnUpdateIsAvailable$1,
    	updatePanelCheckForUpdates: updatePanelCheckForUpdates$1,
    	updatePanelShowUpdateNotifications: updatePanelShowUpdateNotifications$1,
    	strWelcomeModalTitle: strWelcomeModalTitle$1,
    	strWelcomeModalDescription: strWelcomeModalDescription$1,
    	strWelcomeModalOKButton: strWelcomeModalOKButton$1,
    	settingsPanelGeneral: settingsPanelGeneral$1,
    	eOnMillenniumUpdateDoNothing: eOnMillenniumUpdateDoNothing$1,
    	eOnMillenniumUpdateNotify: eOnMillenniumUpdateNotify$1,
    	eOnMillenniumUpdateAutoInstall: eOnMillenniumUpdateAutoInstall$1,
    	errorFailedConnection: errorFailedConnection$1,
    	errorFailedConnectionBody: errorFailedConnectionBody$1,
    	errorFailedConnectionButton: errorFailedConnectionButton$1,
    	errorFailedToDownloadPlugin: errorFailedToDownloadPlugin$1,
    	errorFailedToFetchPlugin: errorFailedToFetchPlugin$1,
    	errorFailedToFetchTheme: errorFailedToFetchTheme$1,
    	errorFailedToStartThemeInstaller: errorFailedToStartThemeInstaller$1,
    	errorFailedToUninstallTheme: errorFailedToUninstallTheme$1,
    	errorInvalidID: errorInvalidID$1,
    	headerNotifications: headerNotifications$1,
    	headerOnStartup: headerOnStartup$1,
    	headerThemes: headerThemes$1,
    	headerUpdates: headerUpdates$1,
    	HoldOn: HoldOn$1,
    	millenniumUpdateSuccessMessage: millenniumUpdateSuccessMessage$1,
    	millenniumUpdateSuccessTitle: millenniumUpdateSuccessTitle$1,
    	optionBrowseLocalFiles: optionBrowseLocalFiles$1,
    	optionCheckForMillenniumUpdates: optionCheckForMillenniumUpdates$1,
    	optionCheckForThemeAndPluginUpdates: optionCheckForThemeAndPluginUpdates$1,
    	optionInstallPlugin: optionInstallPlugin$1,
    	optionInstallTheme: optionInstallTheme$1,
    	optionWhenAnUpdateForMillenniumIsAvailable: optionWhenAnUpdateForMillenniumIsAvailable$1,
    	optionWhenAPluginOrThemeUpdateIsAvailable: optionWhenAPluginOrThemeUpdateIsAvailable$1,
    	strAbout: strAbout$1,
    	strAboutBuildDate: strAboutBuildDate$1,
    	strAboutVersion: strAboutVersion$1,
    	strAlreadyInPluginLibrary: strAlreadyInPluginLibrary$1,
    	strAlreadyInstalled: strAlreadyInstalled$1,
    	strByAuthor: strByAuthor$1,
    	strComplete: strComplete$1,
    	strDone: strDone$1,
    	strEnablePlugin: strEnablePlugin$1,
    	strFinishedUpdating: strFinishedUpdating$1,
    	strInstallComplete: strInstallComplete$1,
    	strInstallPlugin: strInstallPlugin$1,
    	strInstallProgress: strInstallProgress$1,
    	strInvalidPluginBuild: strInvalidPluginBuild$1,
    	strInvalidPluginBuildMessage: strInvalidPluginBuildMessage$1,
    	strMillenniumUpdate: strMillenniumUpdate$1,
    	strNeverMind: strNeverMind$1,
    	strPreparing: strPreparing$1,
    	strReinstall: strReinstall$1,
    	strSuccessfulInstall: strSuccessfulInstall$1,
    	strUnknown: strUnknown$1,
    	strUpdatingPlugin: strUpdatingPlugin$1,
    	strUpdatingTheme: strUpdatingTheme$1,
    	strUseThemeRequiresReload: strUseThemeRequiresReload$1,
    	themeAndPluginUpdateNotification: themeAndPluginUpdateNotification$1,
    	toggleWantsMillenniumUpdates: toggleWantsMillenniumUpdates$1,
    	toggleWantsMillenniumUpdatesNotifications: toggleWantsMillenniumUpdatesNotifications$1,
    	toggleWantsMillenniumUpdatesNotificationsTooltip: toggleWantsMillenniumUpdatesNotificationsTooltip$1,
    	toggleWantsMillenniumUpdatesTooltip: toggleWantsMillenniumUpdatesTooltip$1,
    	tooltipCheckForMillenniumUpdates: tooltipCheckForMillenniumUpdates$1,
    	updateFailedPluginRunning: updateFailedPluginRunning$1,
    	updatePanelErrorBody: updatePanelErrorBody$1,
    	updatePanelErrorButton: updatePanelErrorButton$1,
    	updatePanelErrorHeader: updatePanelErrorHeader$1,
    	updatePanelNoUpdatesFoundHeader: updatePanelNoUpdatesFoundHeader$1,
    	updatePlural: updatePlural$1,
    	updateSingular: updateSingular$1,
    	warningConflictingFiles: warningConflictingFiles$1,
    	warningThemeAlreadyInstalled: warningThemeAlreadyInstalled$1,
    	warnProceedInstallation: warnProceedInstallation$1
    };

    var settingsPanelPlugins = "Eklentiler";
    var settingsPanelThemes = "Temalar";
    var settingsPanelGeneral = "Genel";
    var settingsPanelUpdates = "Güncellemeler";
    var settingsPanelLogs = "Logs";
    var settingsPanelSettings = "Ayarlar";
    var settingsPanelAbout = "Hakkında";
    var settingsPanelBugReport = "Hata Bildir";
    var itemNoDescription = "Henüz açıklama yok.";
    var themePanelClientTheme = "Kullanıcı Teması";
    var themePanelThemeTooltip = "Steam'in kullanmasını istediğiniz temayı seçin (yeniden başlatma gerektirir)";
    var pluginPanelPluginTooltip = "Hiç eklenti yüklemediniz mi? ";
    var themePanelGetMoreThemes = "Daha fazla tema edinin";
    var pluginPanelGetMorePlugins = "Eklentileri burada bulabilirsiniz";
    var themePanelInjectJavascript = "JavaScript eklenmesine izin ver";
    var themePanelInjectJavascriptToolTip = "Temaların Steam'e JavaScript eklemesine izin verilip verilmeyeceğine karar verin. JavaScript'i devre dışı bırakmak, bir yan etki olarak Steam arayüzünü bozabilir (yeniden başlatma gerektirir)";
    var themePanelInjectCSS = "Stil Sayfası eklenmesine izin ver";
    var themePanelInjectCSSToolTip = "Temaların Steam'e stil sayfaları eklemesine izin verilip verilmeyeceğine karar verin. (yeniden başlatma gerektirir)";
    var themePanelCustomAccentColor = "Vurgu Rengini Geçersiz Kıl";
    var themePanelCustomAccentColorToolTip = "Steam içindeki sistem vurgu renginizi geçersiz kılın. Bu, sistem vurgu renginizi kullanan bir tema olmadıkça etkili olmaz.";
    var themePanelCustomColorNotUsed = "Not: Aktif tema bu ayarı KULLANMIYOR.";
    var themePanelCustomColorUsed = "Not: Aktif tema bu ayarı kullanıyor!";
    var updatePanelHasUpdates = "Güncellemeler Mevcut!";
    var updatePanelHasUpdatesSub = "Digitaldepot sizin için aşağıdaki güncellemeleri buldu!";
    var updatePanelReleasedTag = "Yayınlandı:";
    var updatePanelReleasePatchNotes = "Yama Notları:";
    var updatePanelIsUpdating = "Güncelleniyor...";
    var updatePanelUpdate = "Güncelle";
    var updatePanelNoUpdatesFound = "Güncelleme bulunamadı. Her şey güncel!";
    var ViewMore = "Daha Fazla Görüntüle";
    var aboutThemeAnonymous = "Anonim";
    var aboutThemeTitle = "Hakkında";
    var aboutThemeVerifiedDev = "Doğrulanmış Geliştirici";
    var viewSourceCode = "Kaynak Kodunu Görüntüle";
    var showInFolder = "Klasörde Göster";
    var uninstall = "Kaldır";
    var optionSaveChanges = "Değişiklikleri Kaydet";
    var optionReloadNow = "Şimdi Yeniden Yükle";
    var optionReloadLater = "Daha Sonra Yeniden Yükle";
    var optionReloadRequired = "Yeniden Yükleme Gerekli";
    var optionPluginNeedsReload = "Seçili eklentileri etkinleştirmek veya devre dışı bırakmak için yeniden yükleme gerekir. Devam etmek istediğinizden emin misiniz?";
    var updatePanelUpdateNotifications = "Bildirimleri Göster";
    var updatePanelUpdateNotificationsTooltip = "Kitaplığınızdaki bir öğe için bir güncelleme olduğunda Digitaldepot'un size bir hatırlatma vermesini sağlayın!";
    var customThemeSettingsColors = "Renkler";
    var customThemeSettingsConfig = "Özel Ayarlar";
    var errorMessageTitle = "Eyvah!";
    var errorSubmitIssueNotValid = "Hata bildiriminiz geçerli değil. Sorununuzun bir eklenti veya tema içermediğinden emin olun, eğer içeriyorsa lütfen eklentinin veya temanın geliştiricisiyle iletişime geçin.";
    var errorSubmitIssueNoDescription = "Lütfen sorununuzun bir açıklamasını yapın (10 karakter veya daha fazla).";
    var errorSubmitIssueNoSteps = "Lütfen sorununuzu nasıl yeniden oluşturacağınıza dair bir genel bakış sunun (10 karakter veya daha fazla).";
    var errorSubmitIssueTooFrequent = "Vay canına! Çok hızlı sorun gönderiyorsunuz. Lütfen başka bir sorun göndermeden önce biraz bekleyin.";
    var updateSuccessful = "{0} başarıyla güncellendi";
    var updateSuccessfulRestart = "{0} başarıyla güncellendi! Şu anda aktif olarak kullandığınız için, değişikliklerin etkili olması için Steam'i yeniden başlatmanız gerekecektir.";
    var updateFailed = "{0} güncellenemedi! Daha fazla bilgi için kayıtlara bakın.";
    var messageTitleWarning = "Bir Saniye!";
    var messageUpdateDisableClarification = "Güncelleme kontrollerini tamamen mi devre dışı bırakmak istiyorsunuz, yoksa sadece bu bildirimleri mi devre dışı bırakmak istiyorsunuz? Bunu daha sonra Digitaldepot Ayarları'ndan istediğiniz zaman değiştirebilirsiniz.";
    var DisableUpdates = "Güncellemeleri Devre Dışı Bırak";
    var DisableOnlyNotifications = "Sadece Bildirimler";
    var message1162025SecurityUpdate = "Size ve bir bütün olarak topluluğa daha iyi fayda sağlamak için güvenlik protokollerimizi güncellemeye karar veriyoruz. 27.03.2025 tarihinden itibaren, Digitaldepot'dan güncelleme almak isteyip istemediğinizi açıkça sormak için önlemler uygulamaya karar verdik.";
    var message1162025SecurityUpdateTooltip = "Bu yalnızca Digitaldepot güncellemeleridir, ayrı olarak ele alınan ve hiçbir zaman otomatik olmayan tema ve eklenti güncellemeleri değildir.";
    var updateSecurityWarning = "Bu ayarları etkin tutmanız şiddetle tavsiye edilir, çünkü bu her zaman en son güvenlik düzeltmeleriyle güncel olmanızı sağlar. Digitaldepot'u güncel tutmamak güvenlik açıklarına, bozuk özelliklere veya diğer sorunlara neden olabilir.";
    var settingsAreChangeableLater = "Bu ayarları daha sonra Digitaldepot Ayarları'ndan değiştirebilirsiniz.";
    var strViewUpdateDiffInBrowser = "Farkı Tarayıcıda Görüntüle";
    var strViewDownloadInfo = "İndirme Bilgilerini Görüntüle";
    var strUpdateNextStartup = "Bir Sonraki Başlangıçta Güncelle";
    var strUpdateReject = "Şimdi Değil";
    var strDontShowAgain = "Bunu bir daha gösterme";
    var strAnUpdateIsAvailable = "Digitaldepot için bir güncelleme mevcut! Güncellemeleri almayı seçtiğiniz için bu mesajı size gösteriyoruz. Artık bu mesajları almak istemiyorsanız, otomatik güncellemeleri açabilir veya Digitaldepot Ayarları'ndan güncellemeleri tamamen devre dışı bırakabilirsiniz.";
    var updatePanelCheckForUpdates = "Güncellemeleri Kontrol Et";
    var updatePanelShowUpdateNotifications = "Güncelleme Bildirimlerini Göster";
    var HoldOn = "Bekle!";
    var updateFailedPluginRunning = "Digitaldepot çalışırken \"{0}\" güncellenemiyor, önce devre dışı bırakmanız gerekecek.";
    var themeAndPluginUpdateNotification = "{1} için {0} yeni güncelleme bulundu";
    var updateSingular = "güncelleme";
    var updatePlural = "güncellemeler";
    var updatePanelErrorHeader = "Güncellemeler kontrol edilirken bir hata oluştu!";
    var updatePanelErrorBody = "Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin. ";
    var updatePanelErrorButton = "Yeniden Dene";
    var errorFailedConnection = "Digitaldepot'a bağlanılamadı!";
    var errorFailedConnectionBody = "Bu sorun ağla ilgili değil, büyük olasılıkla Digitaldepot'un ihtiyaç duyduğu bir dosya eksik veya beklenmedik bir hatayla karşılaşıyorsunuz.";
    var errorFailedConnectionButton = "Kayıtlar Klasörünü Aç";
    var strDone = "Bitti";
    var strUnknown = "Bilinmeyen";
    var strInstallPlugin = "{0} yükle";
    var strSuccessfulInstall = "{0} başarıyla yüklendi!";
    var strInstallComplete = "Yükleme Tamamlandı";
    var strInstallProgress = "Yükleme İlerlemesi";
    var strEnablePlugin = "Eklentiyi Etkinleştir (Yeniden Yükleme Gerekir)";
    var strUseThemeRequiresReload = "Temayı Kullan (Yeniden Başlatma Gerekir)";
    var strInvalidPluginBuildMessage = "Bu eklentinin işletim sisteminiz için geçerli bir yapısı yok.";
    var strInvalidPluginBuild = "Geçersiz Yapı";
    var strAlreadyInPluginLibrary = "{0} zaten eklenti kitaplığınızda!";
    var strAlreadyInstalled = "Zaten Yüklü";
    var errorFailedToDownloadPlugin = "Eklenti indirilemedi: {0}";
    var errorFailedToStartThemeInstaller = "Dahili yükleyici modülü başlatılamadı...";
    var warningConflictingFiles = "Çakışan Dosyalar";
    var warningThemeAlreadyInstalled = "Bu temayı zaten yüklediniz! Yeniden yüklemek ister misiniz? Herhangi bir özel dosya eklediyseniz verileri kaybolacaktır.";
    var errorFailedToUninstallTheme = "Tema kaldırılamadı: {0}";
    var strNeverMind = "Boş Ver";
    var strReinstall = "Yeniden Yükle";
    var errorFailedToFetchTheme = "Tema bilgileri getirilemedi: ";
    var errorFailedToFetchPlugin = "Eklenti bilgileri getirilemedi: ";
    var errorInvalidID = "Kimlik boş veya geçersiz";
    var warnProceedInstallation = "Kuruluma devam etmek istediğinizden emin misiniz?";
    var strByAuthor = "Yazan: {0}";
    var strUpdatingTheme = "Tema güncelleniyor...";
    var strFinishedUpdating = "Güncelleme bitti!";
    var strPreparing = "Hazırlanıyor...";
    var strUpdatingPlugin = "Eklenti güncelleniyor...";
    var strComplete = "Tamamlandı!";
    var optionCheckForThemeAndPluginUpdates = "Tema ve eklenti güncellemelerini kontrol et";
    var optionWhenAPluginOrThemeUpdateIsAvailable = "Bir eklenti veya tema güncellemesi mevcut olduğunda";
    var headerOnStartup = "Başlangıçta";
    var headerUpdates = "Güncellemeler";
    var headerNotifications = "Bildirimler";
    var headerThemes = "Temalar";
    var optionInstallPlugin = "Bir eklenti yükle";
    var optionInstallTheme = "Bir tema yükle";
    var optionBrowseLocalFiles = "Yerel dosyalara göz at";
    var strWelcomeModalTitle = "Digitaldepot'a Hoş Geldiniz 👋";
    var strWelcomeModalDescription = "Steam'iniz artık DigitalDepot ile entegre!\n\nDigitalDepot uygulamasını ilk kez çalıştırdığınız için, şimdi bizimle yolculuğunuza başlayalım!\n\nYardıma ihtiyacınız olursa, doğrudan [Digitaldepot](https://digitaldepot.id/) adresinden canlı sohbet edebilirsiniz 💬\n\nDigitalDepot ile yeni deneyiminizin keyfini çıkarın 🚀";
    var strWelcomeModalOKButton = "Anladım!";
    var strAbout = "Hakkında";
    var strAboutVersion = "Digitaldepot sürümü";
    var strAboutBuildDate = "Digitaldepot derleme tarihi";
    var eOnMillenniumUpdateDoNothing = "Hiçbir şey yapma";
    var eOnMillenniumUpdateNotify = "Bana bildir";
    var eOnMillenniumUpdateAutoInstall = "Otomatik olarak yükle";
    var millenniumUpdateSuccessMessage = "Digitaldepot başarıyla {0} sürümüne güncellendi. Değişiklikler yeniden başlatma sonrasında geçerli olacak.";
    var millenniumUpdateSuccessTitle = "Başarıyla güncellendi!";
    var optionCheckForMillenniumUpdates = "Digitaldepot güncellemelerini kontrol et";
    var optionWhenAnUpdateForMillenniumIsAvailable = "Digitaldepot için bir güncelleme mevcut olduğunda";
    var strMillenniumUpdate = "Digitaldepot Güncellemeleri";
    var toggleWantsMillenniumUpdates = "Digitaldepot'un güncellemeleri kontrol etmesini ister misiniz?";
    var toggleWantsMillenniumUpdatesNotifications = "Güncellemeler bulunduğunda bildirim almak ister misiniz? (bu popup gibi)";
    var toggleWantsMillenniumUpdatesNotificationsTooltip = "Güncelleme kontrolü açıksa, bir güncelleme bulunursa ve bu ayar açıksa, güncelleme veya şu anki sürümde kalma seçeneğiyle bir popup kutusu alacaksınız. Güncelleme kontrolü açıksa, bir güncelleme bulunursa ve bu ayar KAPALI ise, popup kutusu almayacaksınız ve güncelleme otomatik olarak uygulanacaktır.";
    var toggleWantsMillenniumUpdatesTooltip = "Etkinleştirilirse, Digitaldepot otomatik olarak güncellemeleri kontrol edecektir. Bildirimleri devre dışı bırakmadığınız sürece (aşağıdaki ayar) güncellemeler otomatik olarak uygulanmayacaktır. Güncelleme veya reddetme seçeneğiyle bir popup kutusu alacaksınız.";
    var tooltipCheckForMillenniumUpdates = "Güncellemeleri kontrol etme devre dışı bırakıldı, bu ayar etkili olmayacak.";
    var updatePanelNoUpdatesFoundHeader = "Güncelleme yok";
    var turkish = {
    	settingsPanelPlugins: settingsPanelPlugins,
    	settingsPanelThemes: settingsPanelThemes,
    	settingsPanelGeneral: settingsPanelGeneral,
    	settingsPanelUpdates: settingsPanelUpdates,
    	settingsPanelLogs: settingsPanelLogs,
    	settingsPanelSettings: settingsPanelSettings,
    	settingsPanelAbout: settingsPanelAbout,
    	settingsPanelBugReport: settingsPanelBugReport,
    	itemNoDescription: itemNoDescription,
    	themePanelClientTheme: themePanelClientTheme,
    	themePanelThemeTooltip: themePanelThemeTooltip,
    	pluginPanelPluginTooltip: pluginPanelPluginTooltip,
    	themePanelGetMoreThemes: themePanelGetMoreThemes,
    	pluginPanelGetMorePlugins: pluginPanelGetMorePlugins,
    	themePanelInjectJavascript: themePanelInjectJavascript,
    	themePanelInjectJavascriptToolTip: themePanelInjectJavascriptToolTip,
    	themePanelInjectCSS: themePanelInjectCSS,
    	themePanelInjectCSSToolTip: themePanelInjectCSSToolTip,
    	themePanelCustomAccentColor: themePanelCustomAccentColor,
    	themePanelCustomAccentColorToolTip: themePanelCustomAccentColorToolTip,
    	themePanelCustomColorNotUsed: themePanelCustomColorNotUsed,
    	themePanelCustomColorUsed: themePanelCustomColorUsed,
    	updatePanelHasUpdates: updatePanelHasUpdates,
    	updatePanelHasUpdatesSub: updatePanelHasUpdatesSub,
    	updatePanelReleasedTag: updatePanelReleasedTag,
    	updatePanelReleasePatchNotes: updatePanelReleasePatchNotes,
    	updatePanelIsUpdating: updatePanelIsUpdating,
    	updatePanelUpdate: updatePanelUpdate,
    	updatePanelNoUpdatesFound: updatePanelNoUpdatesFound,
    	ViewMore: ViewMore,
    	aboutThemeAnonymous: aboutThemeAnonymous,
    	aboutThemeTitle: aboutThemeTitle,
    	aboutThemeVerifiedDev: aboutThemeVerifiedDev,
    	viewSourceCode: viewSourceCode,
    	showInFolder: showInFolder,
    	uninstall: uninstall,
    	optionSaveChanges: optionSaveChanges,
    	optionReloadNow: optionReloadNow,
    	optionReloadLater: optionReloadLater,
    	optionReloadRequired: optionReloadRequired,
    	optionPluginNeedsReload: optionPluginNeedsReload,
    	updatePanelUpdateNotifications: updatePanelUpdateNotifications,
    	updatePanelUpdateNotificationsTooltip: updatePanelUpdateNotificationsTooltip,
    	customThemeSettingsColors: customThemeSettingsColors,
    	customThemeSettingsConfig: customThemeSettingsConfig,
    	errorMessageTitle: errorMessageTitle,
    	errorSubmitIssueNotValid: errorSubmitIssueNotValid,
    	errorSubmitIssueNoDescription: errorSubmitIssueNoDescription,
    	errorSubmitIssueNoSteps: errorSubmitIssueNoSteps,
    	errorSubmitIssueTooFrequent: errorSubmitIssueTooFrequent,
    	updateSuccessful: updateSuccessful,
    	updateSuccessfulRestart: updateSuccessfulRestart,
    	updateFailed: updateFailed,
    	messageTitleWarning: messageTitleWarning,
    	messageUpdateDisableClarification: messageUpdateDisableClarification,
    	DisableUpdates: DisableUpdates,
    	DisableOnlyNotifications: DisableOnlyNotifications,
    	message1162025SecurityUpdate: message1162025SecurityUpdate,
    	message1162025SecurityUpdateTooltip: message1162025SecurityUpdateTooltip,
    	updateSecurityWarning: updateSecurityWarning,
    	settingsAreChangeableLater: settingsAreChangeableLater,
    	strViewUpdateDiffInBrowser: strViewUpdateDiffInBrowser,
    	strViewDownloadInfo: strViewDownloadInfo,
    	strUpdateNextStartup: strUpdateNextStartup,
    	strUpdateReject: strUpdateReject,
    	strDontShowAgain: strDontShowAgain,
    	strAnUpdateIsAvailable: strAnUpdateIsAvailable,
    	updatePanelCheckForUpdates: updatePanelCheckForUpdates,
    	updatePanelShowUpdateNotifications: updatePanelShowUpdateNotifications,
    	HoldOn: HoldOn,
    	updateFailedPluginRunning: updateFailedPluginRunning,
    	themeAndPluginUpdateNotification: themeAndPluginUpdateNotification,
    	updateSingular: updateSingular,
    	updatePlural: updatePlural,
    	updatePanelErrorHeader: updatePanelErrorHeader,
    	updatePanelErrorBody: updatePanelErrorBody,
    	updatePanelErrorButton: updatePanelErrorButton,
    	errorFailedConnection: errorFailedConnection,
    	errorFailedConnectionBody: errorFailedConnectionBody,
    	errorFailedConnectionButton: errorFailedConnectionButton,
    	strDone: strDone,
    	strUnknown: strUnknown,
    	strInstallPlugin: strInstallPlugin,
    	strSuccessfulInstall: strSuccessfulInstall,
    	strInstallComplete: strInstallComplete,
    	strInstallProgress: strInstallProgress,
    	strEnablePlugin: strEnablePlugin,
    	strUseThemeRequiresReload: strUseThemeRequiresReload,
    	strInvalidPluginBuildMessage: strInvalidPluginBuildMessage,
    	strInvalidPluginBuild: strInvalidPluginBuild,
    	strAlreadyInPluginLibrary: strAlreadyInPluginLibrary,
    	strAlreadyInstalled: strAlreadyInstalled,
    	errorFailedToDownloadPlugin: errorFailedToDownloadPlugin,
    	errorFailedToStartThemeInstaller: errorFailedToStartThemeInstaller,
    	warningConflictingFiles: warningConflictingFiles,
    	warningThemeAlreadyInstalled: warningThemeAlreadyInstalled,
    	errorFailedToUninstallTheme: errorFailedToUninstallTheme,
    	strNeverMind: strNeverMind,
    	strReinstall: strReinstall,
    	errorFailedToFetchTheme: errorFailedToFetchTheme,
    	errorFailedToFetchPlugin: errorFailedToFetchPlugin,
    	errorInvalidID: errorInvalidID,
    	warnProceedInstallation: warnProceedInstallation,
    	strByAuthor: strByAuthor,
    	strUpdatingTheme: strUpdatingTheme,
    	strFinishedUpdating: strFinishedUpdating,
    	strPreparing: strPreparing,
    	strUpdatingPlugin: strUpdatingPlugin,
    	strComplete: strComplete,
    	optionCheckForThemeAndPluginUpdates: optionCheckForThemeAndPluginUpdates,
    	optionWhenAPluginOrThemeUpdateIsAvailable: optionWhenAPluginOrThemeUpdateIsAvailable,
    	headerOnStartup: headerOnStartup,
    	headerUpdates: headerUpdates,
    	headerNotifications: headerNotifications,
    	headerThemes: headerThemes,
    	optionInstallPlugin: optionInstallPlugin,
    	optionInstallTheme: optionInstallTheme,
    	optionBrowseLocalFiles: optionBrowseLocalFiles,
    	strWelcomeModalTitle: strWelcomeModalTitle,
    	strWelcomeModalDescription: strWelcomeModalDescription,
    	strWelcomeModalOKButton: strWelcomeModalOKButton,
    	strAbout: strAbout,
    	strAboutVersion: strAboutVersion,
    	strAboutBuildDate: strAboutBuildDate,
    	eOnMillenniumUpdateDoNothing: eOnMillenniumUpdateDoNothing,
    	eOnMillenniumUpdateNotify: eOnMillenniumUpdateNotify,
    	eOnMillenniumUpdateAutoInstall: eOnMillenniumUpdateAutoInstall,
    	millenniumUpdateSuccessMessage: millenniumUpdateSuccessMessage,
    	millenniumUpdateSuccessTitle: millenniumUpdateSuccessTitle,
    	optionCheckForMillenniumUpdates: optionCheckForMillenniumUpdates,
    	optionWhenAnUpdateForMillenniumIsAvailable: optionWhenAnUpdateForMillenniumIsAvailable,
    	strMillenniumUpdate: strMillenniumUpdate,
    	toggleWantsMillenniumUpdates: toggleWantsMillenniumUpdates,
    	toggleWantsMillenniumUpdatesNotifications: toggleWantsMillenniumUpdatesNotifications,
    	toggleWantsMillenniumUpdatesNotificationsTooltip: toggleWantsMillenniumUpdatesNotificationsTooltip,
    	toggleWantsMillenniumUpdatesTooltip: toggleWantsMillenniumUpdatesTooltip,
    	tooltipCheckForMillenniumUpdates: tooltipCheckForMillenniumUpdates,
    	updatePanelNoUpdatesFoundHeader: updatePanelNoUpdatesFoundHeader
    };

    /**
     * ==================================================
     *   _____ _ _ _             _
     *  |     |_| | |___ ___ ___|_|_ _ _____
     *  | | | | | | | -_|   |   | | | |     |
     *  |_|_|_|_|_|_|___|_|_|_|_|_|___|_|_|_|
     *
     * ==================================================
     *
     * Copyright (c) 2025 Project Millennium
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in all
     * copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     * SOFTWARE.
     */
    const handler$1 = {
        get: function (target, property) {
            if (property in target) {
                return target[property];
            }
            else {
                try {
                    // fallback to english if the target string wasn't found
                    return english?.[property];
                }
                catch (exception) {
                    return 'unknown translation key';
                }
            }
        },
    };
    let locale = new Proxy(english, handler$1);
    const localizationFiles = {
        english,
        polish,
        spanish,
        indonesian,
        schinese,
        german,
        russian,
        italian,
        vietnamese,
        swedish,
        brazilian,
        french,
        turkish,
        // Add other languages here
    };
    const GetLocalization = async () => {
        try {
            const language = await SteamClient.Settings.GetCurrentLanguage();
            console.log(`[Millennium Locales] Loading ${language} locales`, localizationFiles?.[language]);
            if (localizationFiles.hasOwnProperty(language)) {
                locale = new Proxy(localizationFiles[language], handler$1);
            }
            else {
                console.warn(`[Millennium Locales] Localization for language ${language} not found, defaulting to English.`);
            }
        }
        catch (error) {
            console.error('[Millennium Locales] Error loading localization:', error);
        }
    };
    // setup locales on startup - delay until SteamClient is ready
    setTimeout(() => GetLocalization(), 0);
    // @ts-ignore
    const SteamLocale = (strLocale) => LocalizationManager.LocalizeString(strLocale);
    const formatString = (template, ...args) => {
        return template.replace(/{(\d+)}/g, (match, index) => {
            return index < args.length ? args[index] : match; // Replace {index} with the corresponding argument or leave it unchanged
        });
    };

    /**
     * ==================================================
     *   _____ _ _ _             _
     *  |     |_| | |___ ___ ___|_|_ _ _____
     *  | | | | | | | -_|   |   | | | |     |
     *  |_|_|_|_|_|_|___|_|_|_|_|_|___|_|_|_|
     *
     * ==================================================
     *
     * Copyright (c) 2025 Project Digitaldepot
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in all
     * copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     * SOFTWARE.
     */
    client.findClassModule((m) => m.ContextMenuMouseOverlay);
    const deferredSettingLabelClasses = client.findClassModule((m) => m.DeferredSettingLabel);
    client.findClassModule((m) => m.richPresenceLabel && m.blocked);
    const fieldClasses = client.findClassModule((m) => m.FieldLabel && !m.GyroButtonPickerDialog && !m.ControllerOutline && !m.AwaitingEmailConfIcon);
    const pagedSettingsClasses = client.findClassModule((m) => m.PagedSettingsDialog_PageList);
    const settingsClasses = client.findClassModule((m) => m.SettingsTitleBar && m.SettingsDialogButton);
    client.findClassModule((m) => m.GroupMessageTitle && !m.ShortTemplate && !m.TwoLine && !m.FriendIndicator && !m.AchievementIcon);
    client.findClassModule((m) => m.RootMenuButton && m.RootMenuBar && m.SteamButton)?.SteamButton;
    client.findClassModule((m) => m.HoverPosition && m.Ready && m.NoSpace);
    client.findClassModule((m) => m.TextToolTip && m.ToolTipCustom && m.ToolTipTitle);
    client.findClassModule((m) => m.ActionSection && m.LibrarySettings).ActionSection;

    const SanitizeHex = (color) => {
        if (color.startsWith('#')) {
            if (color.length === 9 || color.length === 7) {
                color = color.substring(0, 7);
            }
            if (color.length === 4) {
                return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
            }
        }
        return color;
    };
    const RenderAccentColorPicker = () => {
        const debounceTimer = React.useRef(null);
        const [accentColor, setAccentColor] = React.useState(window.PLUGIN_LIST[pluginName].accentColor.accent);
        const isDefaultColor = SanitizeHex(window.PLUGIN_LIST[pluginName].accentColor.accent) === SanitizeHex(window.PLUGIN_LIST[pluginName].accentColor.originalAccent);
        const UpdateAllWindows = (newColors) => {
            g_PopupManager.m_mapPopups.data_.forEach((element) => {
                element.value_.m_popup.window.document.querySelectorAll('#SystemAccentColorInject').forEach((element) => {
                    DispatchSystemColors(newColors);
                    element.innerText = window.PLUGIN_LIST[pluginName].systemColor;
                });
            });
        };
        const ResetColor = () => handleColorChange(window.PLUGIN_LIST[pluginName].accentColor.originalAccent);
        function handleColorChange(newColor) {
            const sanitizedColor = SanitizeHex(newColor);
            setAccentColor(sanitizedColor);
            window.PLUGIN_LIST[pluginName].accentColor.accent = sanitizedColor;
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
            debounceTimer.current = setTimeout(async () => {
                setAccentColor(sanitizedColor);
                UpdateAllWindows(JSON.parse(await PyChangeAccentColor({ new_color: sanitizedColor })));
            }, 300);
        }
        return (jsxRuntime.jsxs(client.Field, { className: "MillenniumThemes_AccentColorField", "data-default-color": isDefaultColor, label: locale.themePanelCustomAccentColor, description: locale.themePanelCustomAccentColorToolTip, bottomSeparator: "none", children: [jsxRuntime.jsx(client.DialogButton, { className: settingsClasses.SettingsDialogButton, disabled: isDefaultColor, onClick: ResetColor, children: "Reset" }), jsxRuntime.jsx("input", { type: "color", className: "MillenniumColorPicker", value: SanitizeHex(accentColor), onChange: (event) => handleColorChange(event.target.value) })] }));
    };

    // src/utils/env.ts
    var NOTHING = Symbol.for("immer-nothing");
    var DRAFTABLE = Symbol.for("immer-draftable");
    var DRAFT_STATE = Symbol.for("immer-state");
    function die(error, ...args) {
      throw new Error(
        `[Immer] minified error nr: ${error}. Full error at: https://bit.ly/3cXEKWf`
      );
    }

    // src/utils/common.ts
    var getPrototypeOf = Object.getPrototypeOf;
    function isDraft(value) {
      return !!value && !!value[DRAFT_STATE];
    }
    function isDraftable(value) {
      if (!value)
        return false;
      return isPlainObject(value) || Array.isArray(value) || !!value[DRAFTABLE] || !!value.constructor?.[DRAFTABLE] || isMap(value) || isSet(value);
    }
    var objectCtorString = Object.prototype.constructor.toString();
    function isPlainObject(value) {
      if (!value || typeof value !== "object")
        return false;
      const proto = getPrototypeOf(value);
      if (proto === null) {
        return true;
      }
      const Ctor = Object.hasOwnProperty.call(proto, "constructor") && proto.constructor;
      if (Ctor === Object)
        return true;
      return typeof Ctor == "function" && Function.toString.call(Ctor) === objectCtorString;
    }
    function each(obj, iter) {
      if (getArchtype(obj) === 0 /* Object */) {
        Reflect.ownKeys(obj).forEach((key) => {
          iter(key, obj[key], obj);
        });
      } else {
        obj.forEach((entry, index) => iter(index, entry, obj));
      }
    }
    function getArchtype(thing) {
      const state = thing[DRAFT_STATE];
      return state ? state.type_ : Array.isArray(thing) ? 1 /* Array */ : isMap(thing) ? 2 /* Map */ : isSet(thing) ? 3 /* Set */ : 0 /* Object */;
    }
    function has(thing, prop) {
      return getArchtype(thing) === 2 /* Map */ ? thing.has(prop) : Object.prototype.hasOwnProperty.call(thing, prop);
    }
    function set(thing, propOrOldValue, value) {
      const t = getArchtype(thing);
      if (t === 2 /* Map */)
        thing.set(propOrOldValue, value);
      else if (t === 3 /* Set */) {
        thing.add(value);
      } else
        thing[propOrOldValue] = value;
    }
    function is(x, y) {
      if (x === y) {
        return x !== 0 || 1 / x === 1 / y;
      } else {
        return x !== x && y !== y;
      }
    }
    function isMap(target) {
      return target instanceof Map;
    }
    function isSet(target) {
      return target instanceof Set;
    }
    function latest(state) {
      return state.copy_ || state.base_;
    }
    function shallowCopy(base, strict) {
      if (isMap(base)) {
        return new Map(base);
      }
      if (isSet(base)) {
        return new Set(base);
      }
      if (Array.isArray(base))
        return Array.prototype.slice.call(base);
      const isPlain = isPlainObject(base);
      if (strict === true || strict === "class_only" && !isPlain) {
        const descriptors = Object.getOwnPropertyDescriptors(base);
        delete descriptors[DRAFT_STATE];
        let keys = Reflect.ownKeys(descriptors);
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          const desc = descriptors[key];
          if (desc.writable === false) {
            desc.writable = true;
            desc.configurable = true;
          }
          if (desc.get || desc.set)
            descriptors[key] = {
              configurable: true,
              writable: true,
              // could live with !!desc.set as well here...
              enumerable: desc.enumerable,
              value: base[key]
            };
        }
        return Object.create(getPrototypeOf(base), descriptors);
      } else {
        const proto = getPrototypeOf(base);
        if (proto !== null && isPlain) {
          return { ...base };
        }
        const obj = Object.create(proto);
        return Object.assign(obj, base);
      }
    }
    function freeze(obj, deep = false) {
      if (isFrozen(obj) || isDraft(obj) || !isDraftable(obj))
        return obj;
      if (getArchtype(obj) > 1) {
        obj.set = obj.add = obj.clear = obj.delete = dontMutateFrozenCollections;
      }
      Object.freeze(obj);
      if (deep)
        Object.entries(obj).forEach(([key, value]) => freeze(value, true));
      return obj;
    }
    function dontMutateFrozenCollections() {
      die(2);
    }
    function isFrozen(obj) {
      return Object.isFrozen(obj);
    }

    // src/utils/plugins.ts
    var plugins = {};
    function getPlugin(pluginKey) {
      const plugin = plugins[pluginKey];
      if (!plugin) {
        die(0, pluginKey);
      }
      return plugin;
    }

    // src/core/scope.ts
    var currentScope;
    function getCurrentScope() {
      return currentScope;
    }
    function createScope(parent_, immer_) {
      return {
        drafts_: [],
        parent_,
        immer_,
        // Whenever the modified draft contains a draft from another scope, we
        // need to prevent auto-freezing so the unowned draft can be finalized.
        canAutoFreeze_: true,
        unfinalizedDrafts_: 0
      };
    }
    function usePatchesInScope(scope, patchListener) {
      if (patchListener) {
        getPlugin("Patches");
        scope.patches_ = [];
        scope.inversePatches_ = [];
        scope.patchListener_ = patchListener;
      }
    }
    function revokeScope(scope) {
      leaveScope(scope);
      scope.drafts_.forEach(revokeDraft);
      scope.drafts_ = null;
    }
    function leaveScope(scope) {
      if (scope === currentScope) {
        currentScope = scope.parent_;
      }
    }
    function enterScope(immer2) {
      return currentScope = createScope(currentScope, immer2);
    }
    function revokeDraft(draft) {
      const state = draft[DRAFT_STATE];
      if (state.type_ === 0 /* Object */ || state.type_ === 1 /* Array */)
        state.revoke_();
      else
        state.revoked_ = true;
    }

    // src/core/finalize.ts
    function processResult(result, scope) {
      scope.unfinalizedDrafts_ = scope.drafts_.length;
      const baseDraft = scope.drafts_[0];
      const isReplaced = result !== void 0 && result !== baseDraft;
      if (isReplaced) {
        if (baseDraft[DRAFT_STATE].modified_) {
          revokeScope(scope);
          die(4);
        }
        if (isDraftable(result)) {
          result = finalize(scope, result);
          if (!scope.parent_)
            maybeFreeze(scope, result);
        }
        if (scope.patches_) {
          getPlugin("Patches").generateReplacementPatches_(
            baseDraft[DRAFT_STATE].base_,
            result,
            scope.patches_,
            scope.inversePatches_
          );
        }
      } else {
        result = finalize(scope, baseDraft, []);
      }
      revokeScope(scope);
      if (scope.patches_) {
        scope.patchListener_(scope.patches_, scope.inversePatches_);
      }
      return result !== NOTHING ? result : void 0;
    }
    function finalize(rootScope, value, path) {
      if (isFrozen(value))
        return value;
      const state = value[DRAFT_STATE];
      if (!state) {
        each(
          value,
          (key, childValue) => finalizeProperty(rootScope, state, value, key, childValue, path)
        );
        return value;
      }
      if (state.scope_ !== rootScope)
        return value;
      if (!state.modified_) {
        maybeFreeze(rootScope, state.base_, true);
        return state.base_;
      }
      if (!state.finalized_) {
        state.finalized_ = true;
        state.scope_.unfinalizedDrafts_--;
        const result = state.copy_;
        let resultEach = result;
        let isSet2 = false;
        if (state.type_ === 3 /* Set */) {
          resultEach = new Set(result);
          result.clear();
          isSet2 = true;
        }
        each(
          resultEach,
          (key, childValue) => finalizeProperty(rootScope, state, result, key, childValue, path, isSet2)
        );
        maybeFreeze(rootScope, result, false);
        if (path && rootScope.patches_) {
          getPlugin("Patches").generatePatches_(
            state,
            path,
            rootScope.patches_,
            rootScope.inversePatches_
          );
        }
      }
      return state.copy_;
    }
    function finalizeProperty(rootScope, parentState, targetObject, prop, childValue, rootPath, targetIsSet) {
      if (isDraft(childValue)) {
        const path = rootPath && parentState && parentState.type_ !== 3 /* Set */ && // Set objects are atomic since they have no keys.
        !has(parentState.assigned_, prop) ? rootPath.concat(prop) : void 0;
        const res = finalize(rootScope, childValue, path);
        set(targetObject, prop, res);
        if (isDraft(res)) {
          rootScope.canAutoFreeze_ = false;
        } else
          return;
      } else if (targetIsSet) {
        targetObject.add(childValue);
      }
      if (isDraftable(childValue) && !isFrozen(childValue)) {
        if (!rootScope.immer_.autoFreeze_ && rootScope.unfinalizedDrafts_ < 1) {
          return;
        }
        finalize(rootScope, childValue);
        if ((!parentState || !parentState.scope_.parent_) && typeof prop !== "symbol" && Object.prototype.propertyIsEnumerable.call(targetObject, prop))
          maybeFreeze(rootScope, childValue);
      }
    }
    function maybeFreeze(scope, value, deep = false) {
      if (!scope.parent_ && scope.immer_.autoFreeze_ && scope.canAutoFreeze_) {
        freeze(value, deep);
      }
    }

    // src/core/proxy.ts
    function createProxyProxy(base, parent) {
      const isArray = Array.isArray(base);
      const state = {
        type_: isArray ? 1 /* Array */ : 0 /* Object */,
        // Track which produce call this is associated with.
        scope_: parent ? parent.scope_ : getCurrentScope(),
        // True for both shallow and deep changes.
        modified_: false,
        // Used during finalization.
        finalized_: false,
        // Track which properties have been assigned (true) or deleted (false).
        assigned_: {},
        // The parent draft state.
        parent_: parent,
        // The base state.
        base_: base,
        // The base proxy.
        draft_: null,
        // set below
        // The base copy with any updated values.
        copy_: null,
        // Called by the `produce` function.
        revoke_: null,
        isManual_: false
      };
      let target = state;
      let traps = objectTraps;
      if (isArray) {
        target = [state];
        traps = arrayTraps;
      }
      const { revoke, proxy } = Proxy.revocable(target, traps);
      state.draft_ = proxy;
      state.revoke_ = revoke;
      return proxy;
    }
    var objectTraps = {
      get(state, prop) {
        if (prop === DRAFT_STATE)
          return state;
        const source = latest(state);
        if (!has(source, prop)) {
          return readPropFromProto(state, source, prop);
        }
        const value = source[prop];
        if (state.finalized_ || !isDraftable(value)) {
          return value;
        }
        if (value === peek(state.base_, prop)) {
          prepareCopy(state);
          return state.copy_[prop] = createProxy(value, state);
        }
        return value;
      },
      has(state, prop) {
        return prop in latest(state);
      },
      ownKeys(state) {
        return Reflect.ownKeys(latest(state));
      },
      set(state, prop, value) {
        const desc = getDescriptorFromProto(latest(state), prop);
        if (desc?.set) {
          desc.set.call(state.draft_, value);
          return true;
        }
        if (!state.modified_) {
          const current2 = peek(latest(state), prop);
          const currentState = current2?.[DRAFT_STATE];
          if (currentState && currentState.base_ === value) {
            state.copy_[prop] = value;
            state.assigned_[prop] = false;
            return true;
          }
          if (is(value, current2) && (value !== void 0 || has(state.base_, prop)))
            return true;
          prepareCopy(state);
          markChanged(state);
        }
        if (state.copy_[prop] === value && // special case: handle new props with value 'undefined'
        (value !== void 0 || prop in state.copy_) || // special case: NaN
        Number.isNaN(value) && Number.isNaN(state.copy_[prop]))
          return true;
        state.copy_[prop] = value;
        state.assigned_[prop] = true;
        return true;
      },
      deleteProperty(state, prop) {
        if (peek(state.base_, prop) !== void 0 || prop in state.base_) {
          state.assigned_[prop] = false;
          prepareCopy(state);
          markChanged(state);
        } else {
          delete state.assigned_[prop];
        }
        if (state.copy_) {
          delete state.copy_[prop];
        }
        return true;
      },
      // Note: We never coerce `desc.value` into an Immer draft, because we can't make
      // the same guarantee in ES5 mode.
      getOwnPropertyDescriptor(state, prop) {
        const owner = latest(state);
        const desc = Reflect.getOwnPropertyDescriptor(owner, prop);
        if (!desc)
          return desc;
        return {
          writable: true,
          configurable: state.type_ !== 1 /* Array */ || prop !== "length",
          enumerable: desc.enumerable,
          value: owner[prop]
        };
      },
      defineProperty() {
        die(11);
      },
      getPrototypeOf(state) {
        return getPrototypeOf(state.base_);
      },
      setPrototypeOf() {
        die(12);
      }
    };
    var arrayTraps = {};
    each(objectTraps, (key, fn) => {
      arrayTraps[key] = function() {
        arguments[0] = arguments[0][0];
        return fn.apply(this, arguments);
      };
    });
    arrayTraps.deleteProperty = function(state, prop) {
      return arrayTraps.set.call(this, state, prop, void 0);
    };
    arrayTraps.set = function(state, prop, value) {
      return objectTraps.set.call(this, state[0], prop, value, state[0]);
    };
    function peek(draft, prop) {
      const state = draft[DRAFT_STATE];
      const source = state ? latest(state) : draft;
      return source[prop];
    }
    function readPropFromProto(state, source, prop) {
      const desc = getDescriptorFromProto(source, prop);
      return desc ? `value` in desc ? desc.value : (
        // This is a very special case, if the prop is a getter defined by the
        // prototype, we should invoke it with the draft as context!
        desc.get?.call(state.draft_)
      ) : void 0;
    }
    function getDescriptorFromProto(source, prop) {
      if (!(prop in source))
        return void 0;
      let proto = getPrototypeOf(source);
      while (proto) {
        const desc = Object.getOwnPropertyDescriptor(proto, prop);
        if (desc)
          return desc;
        proto = getPrototypeOf(proto);
      }
      return void 0;
    }
    function markChanged(state) {
      if (!state.modified_) {
        state.modified_ = true;
        if (state.parent_) {
          markChanged(state.parent_);
        }
      }
    }
    function prepareCopy(state) {
      if (!state.copy_) {
        state.copy_ = shallowCopy(
          state.base_,
          state.scope_.immer_.useStrictShallowCopy_
        );
      }
    }

    // src/core/immerClass.ts
    var Immer2 = class {
      constructor(config) {
        this.autoFreeze_ = true;
        this.useStrictShallowCopy_ = false;
        /**
         * The `produce` function takes a value and a "recipe function" (whose
         * return value often depends on the base state). The recipe function is
         * free to mutate its first argument however it wants. All mutations are
         * only ever applied to a __copy__ of the base state.
         *
         * Pass only a function to create a "curried producer" which relieves you
         * from passing the recipe function every time.
         *
         * Only plain objects and arrays are made mutable. All other objects are
         * considered uncopyable.
         *
         * Note: This function is __bound__ to its `Immer` instance.
         *
         * @param {any} base - the initial state
         * @param {Function} recipe - function that receives a proxy of the base state as first argument and which can be freely modified
         * @param {Function} patchListener - optional function that will be called with all the patches produced here
         * @returns {any} a new state, or the initial state if nothing was modified
         */
        this.produce = (base, recipe, patchListener) => {
          if (typeof base === "function" && typeof recipe !== "function") {
            const defaultBase = recipe;
            recipe = base;
            const self = this;
            return function curriedProduce(base2 = defaultBase, ...args) {
              return self.produce(base2, (draft) => recipe.call(this, draft, ...args));
            };
          }
          if (typeof recipe !== "function")
            die(6);
          if (patchListener !== void 0 && typeof patchListener !== "function")
            die(7);
          let result;
          if (isDraftable(base)) {
            const scope = enterScope(this);
            const proxy = createProxy(base, void 0);
            let hasError = true;
            try {
              result = recipe(proxy);
              hasError = false;
            } finally {
              if (hasError)
                revokeScope(scope);
              else
                leaveScope(scope);
            }
            usePatchesInScope(scope, patchListener);
            return processResult(result, scope);
          } else if (!base || typeof base !== "object") {
            result = recipe(base);
            if (result === void 0)
              result = base;
            if (result === NOTHING)
              result = void 0;
            if (this.autoFreeze_)
              freeze(result, true);
            if (patchListener) {
              const p = [];
              const ip = [];
              getPlugin("Patches").generateReplacementPatches_(base, result, p, ip);
              patchListener(p, ip);
            }
            return result;
          } else
            die(1, base);
        };
        this.produceWithPatches = (base, recipe) => {
          if (typeof base === "function") {
            return (state, ...args) => this.produceWithPatches(state, (draft) => base(draft, ...args));
          }
          let patches, inversePatches;
          const result = this.produce(base, recipe, (p, ip) => {
            patches = p;
            inversePatches = ip;
          });
          return [result, patches, inversePatches];
        };
        if (typeof config?.autoFreeze === "boolean")
          this.setAutoFreeze(config.autoFreeze);
        if (typeof config?.useStrictShallowCopy === "boolean")
          this.setUseStrictShallowCopy(config.useStrictShallowCopy);
      }
      createDraft(base) {
        if (!isDraftable(base))
          die(8);
        if (isDraft(base))
          base = current(base);
        const scope = enterScope(this);
        const proxy = createProxy(base, void 0);
        proxy[DRAFT_STATE].isManual_ = true;
        leaveScope(scope);
        return proxy;
      }
      finishDraft(draft, patchListener) {
        const state = draft && draft[DRAFT_STATE];
        if (!state || !state.isManual_)
          die(9);
        const { scope_: scope } = state;
        usePatchesInScope(scope, patchListener);
        return processResult(void 0, scope);
      }
      /**
       * Pass true to automatically freeze all copies created by Immer.
       *
       * By default, auto-freezing is enabled.
       */
      setAutoFreeze(value) {
        this.autoFreeze_ = value;
      }
      /**
       * Pass true to enable strict shallow copy.
       *
       * By default, immer does not copy the object descriptors such as getter, setter and non-enumrable properties.
       */
      setUseStrictShallowCopy(value) {
        this.useStrictShallowCopy_ = value;
      }
      applyPatches(base, patches) {
        let i;
        for (i = patches.length - 1; i >= 0; i--) {
          const patch = patches[i];
          if (patch.path.length === 0 && patch.op === "replace") {
            base = patch.value;
            break;
          }
        }
        if (i > -1) {
          patches = patches.slice(i + 1);
        }
        const applyPatchesImpl = getPlugin("Patches").applyPatches_;
        if (isDraft(base)) {
          return applyPatchesImpl(base, patches);
        }
        return this.produce(
          base,
          (draft) => applyPatchesImpl(draft, patches)
        );
      }
    };
    function createProxy(value, parent) {
      const draft = isMap(value) ? getPlugin("MapSet").proxyMap_(value, parent) : isSet(value) ? getPlugin("MapSet").proxySet_(value, parent) : createProxyProxy(value, parent);
      const scope = parent ? parent.scope_ : getCurrentScope();
      scope.drafts_.push(draft);
      return draft;
    }

    // src/core/current.ts
    function current(value) {
      if (!isDraft(value))
        die(10, value);
      return currentImpl(value);
    }
    function currentImpl(value) {
      if (!isDraftable(value) || isFrozen(value))
        return value;
      const state = value[DRAFT_STATE];
      let copy;
      if (state) {
        if (!state.modified_)
          return state.base_;
        state.finalized_ = true;
        copy = shallowCopy(value, state.scope_.immer_.useStrictShallowCopy_);
      } else {
        copy = shallowCopy(value, true);
      }
      each(copy, (key, childValue) => {
        set(copy, key, currentImpl(childValue));
      });
      if (state) {
        state.finalized_ = false;
      }
      return copy;
    }

    // src/immer.ts
    var immer = new Immer2();
    var produce = immer.produce;
    immer.produceWithPatches.bind(
      immer
    );
    immer.setAutoFreeze.bind(immer);
    immer.setUseStrictShallowCopy.bind(immer);
    immer.applyPatches.bind(immer);
    immer.createDraft.bind(immer);
    immer.finishDraft.bind(immer);

    const handler = new EventTarget();
    const ConfigContext = React.createContext(null);
    const OnBackendConfigUpdate = (config) => {
        const parsedConfig = JSON.parse(config);
        handler.dispatchEvent(new CustomEvent('configUpdated', { detail: parsedConfig }));
    };
    /** Expose the function to allow it to be callable from the backend */
    client.Millennium.exposeObj(exports, { OnBackendConfigUpdate });
    const GetBackendConfig = async () => JSON.parse(await PyGetBackendConfig());
    const SetBackendConfig = async (config) => config && (await PySetBackendConfig({ config: JSON.stringify(config), skip_propagation: true }));
    const ConfigProvider = ({ children }) => {
        const [config, setConfig] = React.useState(settingsManager.getConfig());
        const [isLocalUpdate, setIsLocalUpdate] = React.useState(false);
        const OnConfigChange = (event) => {
            setIsLocalUpdate(false); // Reset the flag when receiving backend updates
            setConfig(event.detail);
            settingsManager.setConfigDirect(event.detail);
        };
        React.useEffect(() => {
            handler.addEventListener('configUpdated', OnConfigChange);
            GetBackendConfig().then((cfg) => {
                setConfig(cfg);
                settingsManager.setConfigDirect(cfg);
            });
            return () => {
                handler.removeEventListener('configUpdated', OnConfigChange);
            };
        }, []);
        const updateConfig = React.useCallback((recipe) => {
            setIsLocalUpdate(true); // Set the flag when making local updates
            setConfig((prev) => {
                const next = produce(prev, recipe);
                settingsManager.setConfigDirect(next);
                return next;
            });
        }, []);
        React.useEffect(() => {
            settingsManager.setUpdateFunction(updateConfig);
        }, [updateConfig]);
        React.useEffect(() => {
            if (!isLocalUpdate) {
                return; // Don't propagate if this wasn't a local update
            }
            SetBackendConfig(config);
        }, [config, isLocalUpdate]);
        return jsxRuntime.jsx(ConfigContext.Provider, { value: { config, updateConfig }, children: children });
    };
    const useMillenniumState = () => {
        const ctx = React.useContext(ConfigContext);
        if (!ctx)
            throw new Error('useConfig must be used within a ConfigProvider');
        return ctx.config;
    };
    const useUpdateConfig = () => {
        const ctx = React.useContext(ConfigContext);
        if (!ctx)
            throw new Error('useUpdateConfig must be used within a ConfigProvider');
        return ctx.updateConfig;
    };

    const BBCodeParser = client.findModuleExport((m) => typeof m === 'function' && m?.toString?.().includes('ElementAccumulator') && m?.toString?.().includes('parser.ParseBBCode'));
    const SettingsDialogSubHeader = ({ children }) => jsxRuntime.jsx("div", { className: "SettingsDialogSubHeader", children: children });
    const Separator = () => jsxRuntime.jsx("div", { className: fieldClasses.StandaloneFieldSeparator });
    const DesktopTooltip = client.findModuleDetailsByExport((m) => m?.toString?.().includes(`divProps`) &&
        m?.toString?.().includes(`tooltipProps`) &&
        m?.toString?.().includes(`toolTipContent`) &&
        m?.toString?.().includes(`tool-tip-source`))[1];

    const GeneralViewModal = () => {
        const config = useMillenniumState();
        const updateConfig = useUpdateConfig();
        const handleChange = (key, value) => {
            updateConfig((draft) => {
                draft.general[key] = value;
            });
        };
        const OnMillenniumUpdateOpts = [
            { label: locale.eOnMillenniumUpdateDoNothing, data: OnMillenniumUpdate.DO_NOTHING },
            { label: locale.eOnMillenniumUpdateNotify, data: OnMillenniumUpdate.NOTIFY },
        ];
        if (window.PLUGIN_LIST[pluginName]?.platformType === OSType.Windows) {
            OnMillenniumUpdateOpts.push({ label: locale.eOnMillenniumUpdateAutoInstall, data: OnMillenniumUpdate.AUTO_INSTALL });
        }
        return (jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [jsxRuntime.jsxs(client.DialogControlsSection, { children: [jsxRuntime.jsx(SettingsDialogSubHeader, { children: locale.headerOnStartup }), jsxRuntime.jsx(client.Field, { label: locale.optionCheckForMillenniumUpdates, children: jsxRuntime.jsx(client.Toggle, { value: config.general.checkForMillenniumUpdates, onChange: (e) => handleChange('checkForMillenniumUpdates', e) }) }), jsxRuntime.jsx(client.Field, { label: locale.optionCheckForThemeAndPluginUpdates, bottomSeparator: "none", children: jsxRuntime.jsx(client.Toggle, { value: config.general.checkForPluginAndThemeUpdates, onChange: (e) => handleChange('checkForPluginAndThemeUpdates', e) }) })] }), jsxRuntime.jsxs(client.DialogControlsSection, { children: [jsxRuntime.jsx(SettingsDialogSubHeader, { children: locale.headerUpdates }), jsxRuntime.jsx(client.Field, { label: locale.optionWhenAnUpdateForMillenniumIsAvailable, bottomSeparator: "none", disabled: !config.general.checkForMillenniumUpdates, icon: !config.general.checkForMillenniumUpdates && (jsxRuntime.jsx(DesktopTooltip, { toolTipContent: locale.tooltipCheckForMillenniumUpdates, direction: "top", children: jsxRuntime.jsx(client.IconsModule.ExclamationPoint, { className: deferredSettingLabelClasses.Icon }) })), children: jsxRuntime.jsx(client.Dropdown, { disabled: !config.general.checkForMillenniumUpdates, rgOptions: OnMillenniumUpdateOpts, selectedOption: OnMillenniumUpdateOpts.findIndex((opt) => opt.data === config.general.onMillenniumUpdate), onChange: (e) => handleChange('onMillenniumUpdate', e.data), contextMenuPositionOptions: { bMatchWidth: false }, strDefaultLabel: OnMillenniumUpdateOpts.find((opt) => opt.data === config.general.onMillenniumUpdate)?.label }) })] }), jsxRuntime.jsxs(client.DialogControlsSection, { children: [jsxRuntime.jsx(SettingsDialogSubHeader, { children: locale.headerNotifications }), jsxRuntime.jsx(client.Field, { label: locale.optionWhenAPluginOrThemeUpdateIsAvailable, bottomSeparator: "none", children: jsxRuntime.jsx(client.Toggle, { value: config.general.shouldShowThemePluginUpdateNotifications, onChange: (e) => handleChange('shouldShowThemePluginUpdateNotifications', e) }) })] }), jsxRuntime.jsxs(client.DialogControlsSection, { children: [jsxRuntime.jsx(SettingsDialogSubHeader, { children: locale.headerThemes }), jsxRuntime.jsx(client.Field, { label: locale.themePanelInjectJavascript, children: jsxRuntime.jsx(client.Toggle, { value: config.general.injectJavascript, onChange: (e) => handleChange('injectJavascript', e) }) }), jsxRuntime.jsx(client.Field, { label: locale.themePanelInjectCSS, children: jsxRuntime.jsx(client.Toggle, { value: config.general.injectCSS, onChange: (e) => handleChange('injectCSS', e) }) }), jsxRuntime.jsx(RenderAccentColorPicker, {})] }), jsxRuntime.jsxs(client.DialogControlsSection, { children: [jsxRuntime.jsx(SettingsDialogSubHeader, { children: locale.strAbout }), jsxRuntime.jsx(client.Field, { label: locale.strAboutVersion, children: window.PLUGIN_LIST[pluginName].version }), jsxRuntime.jsx(client.Field, { label: 'Client API version', children: window.MILLENNIUM_FRONTEND_LIB_VERSION }), jsxRuntime.jsx(client.Field, { label: 'Browser API version', children: window.MILLENNIUM_BROWSER_LIB_VERSION }), jsxRuntime.jsx(client.Field, { label: locale.strAboutBuildDate, children: new Date(window.PLUGIN_LIST[pluginName].buildDate).toLocaleString(navigator.language) }), jsxRuntime.jsx(client.Field, { label: 'Loader build date', bottomSeparator: "none", children: new Date(window.MILLENNIUM_LOADER_BUILD_DATE).toLocaleString(navigator.language) })] })] }));
    };

    /**
     * ==================================================
     *   _____ _ _ _             _
     *  |     |_| | |___ ___ ___|_|_ _ _____
     *  | | | | | | | -_|   |   | | | |     |
     *  |_|_|_|_|_|_|___|_|_|_|_|_|___|_|_|_|
     *
     * ==================================================
     *
     * Copyright (c) 2025 Project Millennium
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in all
     * copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     * SOFTWARE.
     */
    const MillenniumIcons = {
        SteamBrewLogo: () => (jsxRuntime.jsx("svg", { xmlns: "http://www.w3.org/2000/svg", xmlnsXlink: "http://www.w3.org/1999/xlink", viewBox: "0,0,256,256", "fill-rule": "nonzero", children: jsxRuntime.jsx("g", { transform: "translate(-40.96,-40.96) scale(1.32,1.32)", children: jsxRuntime.jsx("g", { fill: "currentColor", "fill-rule": "nonzero", stroke: "none", "stroke-width": "1", "stroke-linecap": "butt", "stroke-linejoin": "miter", "stroke-miterlimit": "10", "stroke-dasharray": "", "stroke-dashoffset": "0", "font-family": "none", "font-weight": "none", "font-size": "none", "text-anchor": "none", style: { mixBlendMode: 'normal' }, children: jsxRuntime.jsx("g", { transform: "scale(5.33333,5.33333)", children: jsxRuntime.jsx("path", { d: "M17.5,27c-0.9,0 -1.74,0.27 -2.45,0.73l3.43,1.47c1.27,0.55 1.86,2.02 1.32,3.28c-0.41,0.95 -1.33,1.52 -2.3,1.52c-0.33,0 -0.66,-0.06 -0.98,-0.2l-3.44,-1.47c0.39,2.08 2.22,3.67 4.42,3.67c2.48,0 4.5,-2.02 4.5,-4.5c0,-2.48 -2.02,-4.5 -4.5,-4.5zM30,13c-2.76,0 -5,2.24 -5,5c0,2.76 2.24,5 5,5c2.76,0 5,-2.24 5,-5c0,-2.76 -2.24,-5 -5,-5zM30,21c-1.66,0 -3,-1.34 -3,-3c0,-1.66 1.34,-3 3,-3c1.66,0 3,1.34 3,3c0,1.66 -1.34,3 -3,3zM36.5,6h-25c-3.03,0 -5.5,2.47 -5.5,5.5v12.35l6.98,2.99c1.17,-1.14 2.76,-1.84 4.52,-1.84c0.16,0 0.33,0.01 0.49,0.02l4.07,-6.1c-0.04,-0.3 -0.06,-0.61 -0.06,-0.92c0,-4.41 3.59,-8 8,-8c4.41,0 8,3.59 8,8c0,4.41 -3.59,8 -8,8c-0.14,0 -0.28,-0.01 -0.42,-0.02l-5.65,4.62c0.04,0.3 0.07,0.59 0.07,0.9c0,3.58 -2.92,6.5 -6.5,6.5c-3.58,0 -6.5,-2.92 -6.5,-6.5v-0.06l-5,-2.15v7.21c0,3.03 2.47,5.5 5.5,5.5h25c3.03,0 5.5,-2.47 5.5,-5.5v-25c0,-3.03 -2.47,-5.5 -5.5,-5.5z" }) }) }) }) })),
    };

    /**
     * Used for errors or when there is nothing to display, i.e. no updates -> good
     * to go, etc.
     */
    function Placeholder(props) {
        const { body, children, header, icon } = props;
        return (jsxRuntime.jsxs("div", { className: "MillenniumPlaceholder_Container", children: [jsxRuntime.jsx("div", { className: "MillenniumPlaceholder_Icon", children: icon }), jsxRuntime.jsx("div", { className: "MillenniumPlaceholder_Header", children: header }), jsxRuntime.jsx("div", { className: "MillenniumPlaceholder_Text", children: body }), children && jsxRuntime.jsx("div", { className: "MillenniumPlaceholder_Buttons", children: children })] }));
    }

    const styles = `
:root {
	/* Stolen from Steam store */
	--MillenniumText-Font: "Motiva Sans", Arial, Sans-serif;
	--MillenniumText-HeadingLarge: normal 700 26px/1.4 var(--MillenniumText-Font);
	--MillenniumText-HeadingMedium: normal 700 22px/1.4 var(--MillenniumText-Font);
	--MillenniumText-HeadingSmall: normal 700 18px/1.4 var(--MillenniumText-Font);
	--MillenniumText-BodyLarge: normal 400 16px/1.4 var(--MillenniumText-Font);
	--MillenniumText-BodyMedium: normal 400 14px/1.4 var(--MillenniumText-Font);
	--MillenniumText-BodySmall: normal 400 12px/1.4 var(--MillenniumText-Font);

	--MillenniumTextColor-Normal: #fff;
	/* Matches body and .ModalPosition */
	--MillenniumTextColor-Muted: #969696;
	/* Base for these: #59bf40, stolen from Steam Guard icon in Settings -> Security */
	--MillenniumTextColor-Success: #59bf40;
	--MillenniumTextColor-Error: #bf4040;
	--MillenniumTextColor-Warning: #bfbd40;

	--MillenniumSpacing-Small: 5px;
	--MillenniumSpacing-Normal: 10px;
	--MillenniumSpacing-Large: 20px;

	/* Match Steam's .DialogButton border-radius */
	--MillenniumControls-BorderRadius: 2px;
	--MillenniumControls-IconSize: 16px;
}

.MillenniumButtonsSection {
    display: flex;
    flex-wrap: wrap;
    gap: var(--MillenniumSpacing-Normal);
    margin-top: var(--MillenniumSpacing-Normal);

	.DialogButton {
		width: unset;
		flex-grow: 1;
	}
}

.MillenniumLogsSection .DialogButton {
	width: -webkit-fill-available;
}

.MillenniumButton {
	display: flex !important;
	align-items: center !important;
	justify-content: center !important;
	gap: var(--MillenniumSpacing-Normal) !important;

	svg {
		width: var(--MillenniumControls-IconSize);
		height: var(--MillenniumControls-IconSize);
	}
}

/* Inherits .MillenniumButton */
.MillenniumIconButton {
	--size: 32px;
	padding: 0 !important;
	width: var(--size) !important;
	height: var(--size) !important;
}

.MillenniumColorPicker {
	--size: 34px;
	background: transparent;
	border: none;
	padding: 0;
	/* Align with DialogButton */
	margin-block: 2px;
	flex-shrink: 0;
	width: var(--size);
	height: var(--size);

	&::-webkit-color-swatch-wrapper {
		padding: 0;
	}

	&::-webkit-color-swatch {
		border: none;
		border-radius: var(--MillenniumControls-BorderRadius);
	}
}

/**
 * Placeholder
 */
.MillenniumPlaceholder_Container {
	gap: var(--MillenniumSpacing-Normal);
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	text-align: center;
}

.MillenniumPlaceholder_Icon {
	width: 64px;
}

.MillenniumPlaceholder_Header {
	color: var(--MillenniumTextColor-Normal);
	font: var(--MillenniumText-HeadingMedium);
}

.MillenniumPlaceholder_Text {
	color: var(--MillenniumTextColor-Muted);
	font: var(--MillenniumText-BodyLarge);
}

.MillenniumPlaceholder_Buttons {
	gap: var(--MillenniumSpacing-Normal);
	display: flex;
}

/* Override Steam styles */
.MillenniumSettings {
	/* <SidebarNavigation> is not supposed to be in the main window, so add a
	 * border to distinguish it from the nav bar. */
	border-top: 1px solid rgba(61, 68, 80, .65);
	min-height: 100% !important;

	.DialogContent_InnerWidth {
		max-width: unset !important;
	}

	.DialogContentTransition {
		max-width: unset !important;
	}

	/* Fix the dropdown not filling the proper width when specific theme names are too long. */
	.DialogDropDown {
		min-width: max-content !important;
	}

	textarea.DialogInput {
		width: 100% !important;
	}

	.PageListColumn {
		min-height: unset !important;
	}

	.${fieldClasses.FieldChildrenInner} {
		gap: var(--MillenniumSpacing-Normal);
		align-items: center;
	}

	.${pagedSettingsClasses.PageListItem_Title} {
		overflow: visible !important;
		flex-grow: 1;
	}

	.sideBarUpdatesItem {
		display: flex;
		gap: var(--MillenniumSpacing-Normal);
		justify-content: space-between;
		align-items: center;
		overflow: visible !important;
	}

	.FriendMessageCount {
		display: flex !important;
		margin-top: 0px !important;
		position: initial !important;

		line-height: 20px;
		height: fit-content !important;
		width: fit-content !important;
	}
}

/**
 * Logs
 */
.MillenniumLogs_LogItemButton {
	&:not([data-warning-count="0"]) svg {
		color: var(--MillenniumTextColor-Warning);
	}

	&:not([data-error-count="0"]) svg {
		color: var(--MillenniumTextColor-Error);
	}

	/* Nothing to display */
	&[data-warning-count="0"][data-error-count="0"] > .tool-tip-source {
		display: none;
	}

	& > .tool-tip-source {
		display: flex;
	}
}

.MillenniumLogs_HeaderTextTypeContainer {
	display: flex;
    flex-direction: column;
    justify-content: center;
}

.MillenniumLogs_HeaderTextTypeCount {
	color: var(--MillenniumTextColor-Muted);
	font: var(--MillenniumText-BodySmall);

	&[data-type="error"]:not([data-count="0"]) {
		color: var(--MillenniumTextColor-Error);
	}

	&[data-type="warning"]:not([data-count="0"]) {
		color: var(--MillenniumTextColor-Warning);
	}
}

.MillenniumLogs_TextContainer {
	gap: var(--MillenniumSpacing-Large);
	margin-top: var(--MillenniumSpacing-Small);
	display: flex;
	flex-direction: column;
	height: -webkit-fill-available;
}

.MillenniumLogs_TextControls {
	gap: var(--MillenniumSpacing-Normal);
	display: flex;
	justify-content: space-between;
}

.MillenniumLogs_ControlSection {
	gap: var(--MillenniumSpacing-Normal);
	display: flex;
	justify-content: space-between;
}

.MillenniumLogs_NavContainer {
    display: flex;
    gap: var(--MillenniumSpacing-Normal);
}

.MillenniumLogs_Icons {
	gap: var(--MillenniumSpacing-Normal);
	display: flex;
}

.MillenniumLogs_Text {
	color: inherit;
	line-height: inherit;
	padding: var(--MillenniumSpacing-Normal);
	margin: 0;
	overflow-y: auto;
	white-space: pre-wrap;
	height: 100%;
	user-select: text;
	font-family: Consolas, "Courier New", monospace;
}

/**
 * Plugins
 */
.MillenniumPlugins_PluginLabel,
.MillenniumThemes_ThemeLabel {
	gap: var(--MillenniumSpacing-Normal);
	display: flex;
	align-items: center;
}

.MillenniumItem_Version {
	color: #8b929a;
	font: var(--MillenniumText-BodySmall);
	margin-left: var(--MillenniumSpacing-Normal);
}

/**
 * Themes
 */
.MillenniumThemes_AccentColorField[data-default-color="true"] {
	.DialogButton {
		display: none;
	}
}

/**
 * Updates
 */
.MillenniumUpdates_Description {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: all 0.5s ease;
}

.MillenniumUpdates_Field[data-expanded="false"] {
	.MillenniumUpdates_ExpandButton > svg {
		transform: rotate(180deg);
	}

	.MillenniumUpdates_Description {
		height: 0 !important;
	}
}

.MillenniumUpdates_ProgressBar {
	/* <Field> override */
	align-self: baseline;

	&:not([role="progressbar"]) {
		padding: 0 !important;
		/* icon button size + .DialogButton margin-block * 2 */
		height: calc(32px + 2px * 2) !important;

		&::after {
			content: unset !important;
		}
	}
}

/**
 * Dialogs
 */
.MillenniumInstallerDialog {
	width: 450px;
}

.MillenniumInstallerDialog_ProgressBar div {
	transition: all 0.5s ease 0s !important;
}

.MillenniumInstallerDialog_ProgressBar {
	&::after {
		content: unset !important;
	}

	* { 
		width: 100%; 
		text-align: right;
	}
}

.MillenniumInstallDialog_TutorialImage {
	margin-block: var(--MillenniumSpacing-Normal);
	width: 100%;
}

/**
 * Other
 */
.MillenniumPluginSettingsGrid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--MillenniumSpacing-Large);
    padding: 2ex 5ex 2ex 5ex;
}

._1aw7cA3mAZfWt8idAlVJWi:has(.SliderControlPanelGroup) {
	width: -webkit-fill-available;
}

.MillenniumPluginSettingsSliderValue {
    position: absolute;
    right: 0;
    top: 5px;
    font-size: 14px;
}

.MillenniumPlaceholder_Button {
	min-width: fit-content;
}
`;
    const MillenniumDesktopSidebarStyles = ({ openAnimStart, isDesktopMenuOpen, isViewingPlugin, }) => {
        const styles = `
    .title-area { 
      	z-index: 999999 !important; 
    }

    .MillenniumDesktopSidebar {
		--sidebar-width: 350px;
		position: absolute;
		height: 100%;
		width: var(--sidebar-width);
		top: 0px;
		right: 0px;
		z-index: 999;
		transition: transform 0.4s cubic-bezier(0.65, 0, 0.35, 1);
		transform: ${openAnimStart ? 'translateX(0px)' : 'translateX(calc(var(--sidebar-width) + 16px))'};
		overflow-y: auto;
		display: ${isDesktopMenuOpen ? 'flex' : 'none'};
		flex-direction: column;
		background: #171d25;
    }

	.MillenniumDesktopSidebar_Content {
		padding: ${isViewingPlugin ? '16px 20px 0px 20px' : '16px 0 0 0'};
		display: flex;
		flex-direction: column;
		height: 100%;
	}

    .MillenniumDesktopSidebar_Overlay {
		position: absolute;
		inset: 0;
		z-index: 998;
		/* Match .ModalOverlayBackground */
		background: rgba(0, 0, 0, 0.8);
		opacity: ${openAnimStart ? 1 : 0};
		display: ${isDesktopMenuOpen ? 'flex' : 'none'};
		transition: opacity 0.4s cubic-bezier(0.65, 0, 0.35, 1);
    }

	.MillenniumDesktopSidebar_Title {
		/* Use the top bar's height, since -webkit-app-region is for some reason
		 * unreliable (but set it anyway) here when it touches the top bar, not
		 * letting us press the button but drag the window instead. */
		padding-block-start: 65px;
		padding-inline: 16px;
		position: sticky;
		top: 0;
		-webkit-app-region: no-drag;
	}
    `;
        return jsxRuntime.jsx("style", { children: styles });
    };
    const Styles = () => jsxRuntime.jsx("style", { children: styles });

    var ConditionType;
    (function (ConditionType) {
        ConditionType[ConditionType["Dropdown"] = 0] = "Dropdown";
        ConditionType[ConditionType["Toggle"] = 1] = "Toggle";
    })(ConditionType || (ConditionType = {}));
    var ColorTypes;
    (function (ColorTypes) {
        ColorTypes[ColorTypes["RawRGB"] = 1] = "RawRGB";
        ColorTypes[ColorTypes["RGB"] = 2] = "RGB";
        ColorTypes[ColorTypes["RawRGBA"] = 3] = "RawRGBA";
        ColorTypes[ColorTypes["RGBA"] = 4] = "RGBA";
        ColorTypes[ColorTypes["Hex"] = 5] = "Hex";
        ColorTypes[ColorTypes["Unknown"] = 6] = "Unknown";
    })(ColorTypes || (ColorTypes = {}));
    class RenderThemeEditor extends React.Component {
        constructor() {
            super(...arguments);
            this.GetConditionType = (value) => {
                if (Object.keys(value).every((element) => element === 'yes' || element === 'no')) {
                    return ConditionType.Toggle;
                }
                else {
                    return ConditionType.Dropdown;
                }
            };
            this.UpdateLocalCondition = (conditionName, newData) => {
                const activeTheme = this.props.theme;
                return new Promise((resolve) => {
                    PyChangeCondition({
                        theme: activeTheme.native,
                        newData: newData,
                        condition: conditionName,
                    }).then((response) => {
                        const success = JSON.parse(response)?.success ?? false;
                        success && (window.PLUGIN_LIST[pluginName].ConditionConfigHasChanged = true);
                        resolve(success);
                    });
                });
            };
            this.RenderComponentInterface = ({ conditionType, values, conditionName }) => {
                let store = window.PLUGIN_LIST[pluginName]?.conditionals?.[this.props.theme.native];
                console.log(store, this.props.theme);
                /** Dropdown items if given that the component is a dropdown */
                const items = values.map((value, index) => ({ label: value, data: 'componentId' + index }));
                const [isChecked, setIsChecked] = React.useState(store[conditionName] === 'yes');
                React.useEffect(() => {
                    setIsChecked(store[conditionName] === 'yes');
                }, [store[conditionName]]);
                const onCheckChange = (enabled) => {
                    this.UpdateLocalCondition(conditionName, enabled ? 'yes' : 'no').then((success) => {
                        if (success) {
                            store && (store[conditionName] = enabled ? 'yes' : 'no');
                            setIsChecked(enabled);
                        }
                    });
                };
                const onDropdownChange = (data) => {
                    this.UpdateLocalCondition(conditionName, data.label).then((success) => {
                        success && store && (store[conditionName] = data.label);
                    });
                };
                switch (conditionType) {
                    case ConditionType.Dropdown:
                        // @ts-ignore
                        return (jsxRuntime.jsx(client.Dropdown, { contextMenuPositionOptions: { bMatchWidth: false }, onChange: onDropdownChange, rgOptions: items, selectedOption: 1, strDefaultLabel: store[conditionName] }));
                    case ConditionType.Toggle:
                        return jsxRuntime.jsx(client.Toggle, { value: isChecked, onChange: onCheckChange, navRef: conditionName }, conditionName);
                }
            };
            this.UpdateCSSColors = (color, newColor) => {
                for (const popup of g_PopupManager.GetPopups()) {
                    const rootColors = popup.window.document.getElementById('RootColors');
                    rootColors.innerHTML = rootColors.innerHTML.replace(new RegExp(`${color.color}:.*?;`, 'g'), `${color.color}: ${newColor};`);
                }
            };
            this.RenderComponent = ({ condition, value, isLastItem }) => {
                const conditionType = this.GetConditionType(value.values);
                return (jsxRuntime.jsx(client.Field, { label: condition, description: jsxRuntime.jsx(BBCodeParser, { text: value?.description ?? 'No description yet.' }), className: condition, bottomSeparator: isLastItem ? 'none' : 'standard', children: jsxRuntime.jsx(this.RenderComponentInterface, { conditionType: conditionType, conditionName: condition, values: Object.keys(value?.values) }) }, condition));
            };
            this.RenderColorComponent = ({ color, index }) => {
                const debounceTimer = React.useRef(null);
                const [colorState, setColorState] = React.useState(color?.hex ?? '#000000');
                const saveColor = async (hexColor) => {
                    const newColor = await PyChangeColor({ theme: this.props.theme.native, color_name: color.color, new_color: hexColor, color_type: color.type });
                    window.PLUGIN_LIST[pluginName].RootColors = await PyGetRootColors();
                    return newColor;
                };
                const debounceColorUpdate = (hexColor) => {
                    setColorState(hexColor);
                    if (debounceTimer.current) {
                        clearTimeout(debounceTimer.current);
                    }
                    debounceTimer.current = setTimeout(async () => {
                        const newColor = await saveColor(hexColor);
                        this.UpdateCSSColors(color, newColor);
                    }, 300);
                };
                const resetColor = async () => {
                    setColorState(color.defaultColor);
                    const defaultColor = await saveColor(color.defaultColor);
                    this.UpdateCSSColors(color, defaultColor);
                };
                return (jsxRuntime.jsxs(client.Field, { label: color?.name ?? color?.color, description: jsxRuntime.jsx(BBCodeParser, { text: color?.description ?? 'No description yet.' }), children: [colorState != color.defaultColor && (jsxRuntime.jsx(client.DialogButton, { className: settingsClasses.SettingsDialogButton, onClick: resetColor, children: "Reset" })), jsxRuntime.jsx("input", { type: "color", className: "MillenniumColorPicker", value: colorState, onChange: (event) => debounceColorUpdate(event.target.value) })] }, index));
            };
            this.RenderColorsOpts = () => {
                const [themeColors, setThemeColors] = React.useState();
                React.useEffect(() => {
                    PyGetThemeColorOptions({ theme_name: this.props.theme.native }).then((result) => {
                        setThemeColors(JSON.parse(result));
                    });
                }, []);
                return (jsxRuntime.jsx(jsxRuntime.Fragment, { children: themeColors?.map?.((color, index) => (jsxRuntime.jsx(this.RenderColorComponent, { color: color, index: index }))) }));
            };
            this.RenderThemeEditor = () => {
                const activeTheme = this.props.theme;
                const { data: { Conditions: themeConditions, RootColors, name }, } = activeTheme;
                const entries = Object.entries(themeConditions);
                const hasColors = !!RootColors;
                const hasTabs = entries.some(([, { tab }]) => !!tab);
                const createColorPage = () => ({
                    title: locale.customThemeSettingsColors,
                    content: (jsxRuntime.jsx(client.DialogBody, { className: client.Classes.SettingsDialogBodyFade, children: jsxRuntime.jsx(this.RenderColorsOpts, {}) })),
                });
                const createContentPage = (conditions) => (jsxRuntime.jsx(client.DialogBody, { className: client.Classes.SettingsDialogBodyFade, children: Object.entries(conditions).map(([key, value], index) => (jsxRuntime.jsx(this.RenderComponent, { condition: key, value: value, isLastItem: index === Object.keys(conditions).length - 1 }, key))) }));
                const createTabPages = () => {
                    const pages = entries.reduce((acc, [name, patch]) => {
                        const { tab } = patch;
                        const condition = { [name]: patch };
                        const existingTab = acc.find((p) => p.title === tab);
                        if (existingTab) {
                            existingTab.conditions.push(condition);
                            return acc;
                        }
                        acc.push({ title: tab, conditions: [condition] });
                        return acc;
                    }, []);
                    return pages.map(({ title, conditions }) => ({
                        title,
                        content: createContentPage(conditions.reduce((a, b) => ({ ...a, ...b }), {})),
                    }));
                };
                const tabPages = createTabPages();
                const defaultPage = { ...tabPages.find((p) => !p.title), title: locale.customThemeSettingsConfig };
                const finalTabs = hasTabs ? tabPages.filter((p) => p !== defaultPage) : [defaultPage];
                const className = [settingsClasses.SettingsModal, settingsClasses.DesktopPopup, 'MillenniumSettings'].join(' ');
                const pages = [...finalTabs, ...(hasColors ? ['separator', createColorPage()] : [])];
                const title = name ?? activeTheme.native;
                const hidePageListStyles = !hasTabs && !hasColors ? jsxRuntime.jsx("style", { children: `.PageListColumn { display: none !important; }` }) : null;
                return (jsxRuntime.jsxs(client.ModalPosition, { children: [jsxRuntime.jsx(Styles, {}), hidePageListStyles, jsxRuntime.jsx(client.SidebarNavigation, { className: className, pages: pages, title: title })] }));
            };
        }
        render() {
            return jsxRuntime.jsx(this.RenderThemeEditor, {});
        }
    }

    var Utils;
    (function (Utils) {
        function BrowseLocalFolder(path) {
            SteamClient.System.OpenLocalDirectoryInSystemExplorer(path);
        }
        Utils.BrowseLocalFolder = BrowseLocalFolder;
        function OpenUrl(url) {
            Logger.Log('Opening URL:', url);
            SteamClient.System.OpenInSystemBrowser(url);
        }
        Utils.OpenUrl = OpenUrl;
        async function GetPluginAssetUrl() {
            const FindAllPlugins = __wrapped_callable__('find_all_plugins');
            const plugins = JSON.parse(await FindAllPlugins());
            const injectedScript = Array.from(document.scripts).find((script) => script.id === 'Digitaldepot-injected');
            if (!injectedScript || !injectedScript.src) {
                return String();
            }
            const url = new URL(injectedScript.src);
            const pluginPath = plugins.find((plugin) => plugin?.data?.name === 'core').path.replace(/\\/g, '/');
            const encoded = pluginPath
                .split('/')
                .map((part) => encodeURIComponent(part))
                .join('/');
            return `https://${url.hostname}:${url.port}/${encoded}/.Digitaldepot/Dist`;
        }
        Utils.GetPluginAssetUrl = GetPluginAssetUrl;
        Utils.PromptReload = (callback) => {
            const title = SteamLocale('#Settings_RestartRequired_Title');
            const description = SteamLocale('#Settings_RestartRequired_Description');
            const buttonText = SteamLocale('#Settings_RestartNow_ButtonText');
            client.showModal(jsxRuntime.jsx(client.ConfirmModal, { strTitle: title, strDescription: description, strOKButtonText: buttonText, onOK: callback.spread(true), onCancel: callback.spread(false) }), window.PLUGIN_LIST[pluginName].mainWindow, {
                bNeverPopOut: false,
            });
        };
        Utils.URLComponent = ({ url }) => {
            return (jsxRuntime.jsx("a", { href: "#", onClick: Utils.OpenUrl.spread(url), children: url }));
        };
        /**
         *
         * @param dateString - The date string to convert to a relative time format.
         * @returns
         */
        Utils.toTimeAgo = (dateString) => {
            const rtf = new Intl.RelativeTimeFormat(navigator.language, { numeric: 'auto' });
            const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
            const intervals = { year: 31536000, month: 2592000, week: 604800, day: 86400, hour: 3600, minute: 60, second: 1 };
            for (const unit in intervals) {
                const value = intervals[unit];
                if (seconds >= value)
                    return rtf.format(-Math.floor(seconds / value), unit);
            }
            return rtf.format(0, 'second');
        };
        Utils.ShowMessageBox = (message, title, props) => {
            return new Promise((resolve) => {
                const onOK = () => resolve(true);
                const onCancel = () => resolve(false);
                client.showModal(jsxRuntime.jsx(client.ConfirmModal, { strTitle: title ?? SteamLocale('#InfoSettings_Title'), strDescription: message, onOK: onOK, onCancel: onCancel, ...props }), window.PLUGIN_LIST[pluginName].mainWindow, {
                    bNeverPopOut: false,
                });
            });
        };
    })(Utils || (Utils = {}));
    Function.prototype.spread = function (...boundArgs) {
        return this.bind(null, ...boundArgs);
    };

    var DefaultContext = {
      color: undefined,
      size: undefined,
      className: undefined,
      style: undefined,
      attr: undefined
    };
    var IconContext = React.createContext && /*#__PURE__*/React.createContext(DefaultContext);

    var _excluded = ["attr", "size", "title"];
    function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }
    function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } } return target; }
    function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
    function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
    function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), true).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
    function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
    function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
    function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
    function Tree2Element(tree) {
      return tree && tree.map((node, i) => /*#__PURE__*/React.createElement(node.tag, _objectSpread({
        key: i
      }, node.attr), Tree2Element(node.child)));
    }
    function GenIcon(data) {
      return props => /*#__PURE__*/React.createElement(IconBase, _extends({
        attr: _objectSpread({}, data.attr)
      }, props), Tree2Element(data.child));
    }
    function IconBase(props) {
      var elem = conf => {
        var {
            attr,
            size,
            title
          } = props,
          svgProps = _objectWithoutProperties(props, _excluded);
        var computedSize = size || conf.size || "1em";
        var className;
        if (conf.className) className = conf.className;
        if (props.className) className = (className ? className + " " : "") + props.className;
        return /*#__PURE__*/React.createElement("svg", _extends({
          stroke: "currentColor",
          fill: "currentColor",
          strokeWidth: "0"
        }, conf.attr, attr, svgProps, {
          className: className,
          style: _objectSpread(_objectSpread({
            color: props.color || conf.color
          }, conf.style), props.style),
          height: computedSize,
          width: computedSize,
          xmlns: "http://www.w3.org/2000/svg"
        }), title && /*#__PURE__*/React.createElement("title", null, title), props.children);
      };
      return IconContext !== undefined ? /*#__PURE__*/React.createElement(IconContext.Consumer, null, conf => elem(conf)) : elem(DefaultContext);
    }

    // THIS FILE IS AUTO GENERATED
    function FaArrowLeft (props) {
      return GenIcon({"attr":{"viewBox":"0 0 448 512"},"child":[{"tag":"path","attr":{"d":"M257.5 445.1l-22.2 22.2c-9.4 9.4-24.6 9.4-33.9 0L7 273c-9.4-9.4-9.4-24.6 0-33.9L201.4 44.7c9.4-9.4 24.6-9.4 33.9 0l22.2 22.2c9.5 9.5 9.3 25-.4 34.3L136.6 216H424c13.3 0 24 10.7 24 24v32c0 13.3-10.7 24-24 24H136.6l120.5 114.8c9.8 9.3 10 24.8.4 34.3z"},"child":[]}]})(props);
    }function FaCheck (props) {
      return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z"},"child":[]}]})(props);
    }function FaEllipsisH (props) {
      return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M328 256c0 39.8-32.2 72-72 72s-72-32.2-72-72 32.2-72 72-72 72 32.2 72 72zm104-72c-39.8 0-72 32.2-72 72s32.2 72 72 72 72-32.2 72-72-32.2-72-72-72zm-352 0c-39.8 0-72 32.2-72 72s32.2 72 72 72 72-32.2 72-72-32.2-72-72-72z"},"child":[]}]})(props);
    }function FaFolderOpen (props) {
      return GenIcon({"attr":{"viewBox":"0 0 576 512"},"child":[{"tag":"path","attr":{"d":"M572.694 292.093L500.27 416.248A63.997 63.997 0 0 1 444.989 448H45.025c-18.523 0-30.064-20.093-20.731-36.093l72.424-124.155A64 64 0 0 1 152 256h399.964c18.523 0 30.064 20.093 20.73 36.093zM152 224h328v-48c0-26.51-21.49-48-48-48H272l-64-64H48C21.49 64 0 85.49 0 112v278.046l69.077-118.418C86.214 242.25 117.989 224 152 224z"},"child":[]}]})(props);
    }function FaPaintRoller (props) {
      return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M416 128V32c0-17.67-14.33-32-32-32H32C14.33 0 0 14.33 0 32v96c0 17.67 14.33 32 32 32h352c17.67 0 32-14.33 32-32zm32-64v128c0 17.67-14.33 32-32 32H256c-35.35 0-64 28.65-64 64v32c-17.67 0-32 14.33-32 32v128c0 17.67 14.33 32 32 32h64c17.67 0 32-14.33 32-32V352c0-17.67-14.33-32-32-32v-32h160c53.02 0 96-42.98 96-96v-64c0-35.35-28.65-64-64-64z"},"child":[]}]})(props);
    }function FaSave (props) {
      return GenIcon({"attr":{"viewBox":"0 0 448 512"},"child":[{"tag":"path","attr":{"d":"M433.941 129.941l-83.882-83.882A48 48 0 0 0 316.118 32H48C21.49 32 0 53.49 0 80v352c0 26.51 21.49 48 48 48h352c26.51 0 48-21.49 48-48V163.882a48 48 0 0 0-14.059-33.941zM224 416c-35.346 0-64-28.654-64-64 0-35.346 28.654-64 64-64s64 28.654 64 64c0 35.346-28.654 64-64 64zm96-304.52V212c0 6.627-5.373 12-12 12H76c-6.627 0-12-5.373-12-12V108c0-6.627 5.373-12 12-12h228.52c3.183 0 6.235 1.264 8.485 3.515l3.48 3.48A11.996 11.996 0 0 1 320 111.48z"},"child":[]}]})(props);
    }function FaStore (props) {
      return GenIcon({"attr":{"viewBox":"0 0 616 512"},"child":[{"tag":"path","attr":{"d":"M602 118.6L537.1 15C531.3 5.7 521 0 510 0H106C95 0 84.7 5.7 78.9 15L14 118.6c-33.5 53.5-3.8 127.9 58.8 136.4 4.5.6 9.1.9 13.7.9 29.6 0 55.8-13 73.8-33.1 18 20.1 44.3 33.1 73.8 33.1 29.6 0 55.8-13 73.8-33.1 18 20.1 44.3 33.1 73.8 33.1 29.6 0 55.8-13 73.8-33.1 18.1 20.1 44.3 33.1 73.8 33.1 4.7 0 9.2-.3 13.7-.9 62.8-8.4 92.6-82.8 59-136.4zM529.5 288c-10 0-19.9-1.5-29.5-3.8V384H116v-99.8c-9.6 2.2-19.5 3.8-29.5 3.8-6 0-12.1-.4-18-1.2-5.6-.8-11.1-2.1-16.4-3.6V480c0 17.7 14.3 32 32 32h448c17.7 0 32-14.3 32-32V283.2c-5.4 1.6-10.8 2.9-16.4 3.6-6.1.8-12.1 1.2-18.2 1.2z"},"child":[]}]})(props);
    }

    // THIS FILE IS AUTO GENERATED
    function SiKofi (props) {
      return GenIcon({"attr":{"role":"img","viewBox":"0 0 24 24"},"child":[{"tag":"path","attr":{"d":"M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.076-.057-.108-.09-.108-.09-.443-.441-3.368-3.049-4.034-3.954-.709-.965-1.041-2.7-.091-3.71.951-1.01 3.005-1.086 4.363.407 0 0 1.565-1.782 3.468-.963 1.904.82 1.832 3.011.723 4.311zm6.173.478c-.928.116-1.682.028-1.682.028V7.284h1.77s1.971.551 1.971 2.638c0 1.913-.985 2.667-2.059 3.015z"},"child":[]}]})(props);
    }

    function IconButton(props) {
        const { children } = props;
        return (jsxRuntime.jsx(client.DialogButton, { ...props, className: client.joinClassNames('DigitaldepotButton', 'DigitaldepotIconButton', settingsClasses.SettingsDialogButton, props.className), children: children }));
    }

    var UIReloadProps;
    (function (UIReloadProps) {
        UIReloadProps[UIReloadProps["None"] = 0] = "None";
        UIReloadProps[UIReloadProps["Force"] = 1] = "Force";
        UIReloadProps[UIReloadProps["Prompt"] = 2] = "Prompt";
    })(UIReloadProps || (UIReloadProps = {}));
    const ChangeActiveTheme = async (themeName, reloadProps) => {
        await __wrapped_callable__('theme_config.change_theme')({ theme_name: themeName });
        return new Promise((resolve) => {
            switch (reloadProps) {
                case UIReloadProps.Force:
                    SteamClient.Browser.RestartJSContext();
                    resolve(true);
                    break;
                case UIReloadProps.Prompt:
                    Utils.PromptReload((hasClickedOk) => {
                        SteamClient.Browser.RestartJSContext();
                        resolve(hasClickedOk);
                    });
                    break;
                default:
                    resolve(true);
                    break;
            }
        });
    };
    class ThemeItemComponent extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                shouldShowMore: false,
            };
            this.showCtxMenu = this.showCtxMenu.bind(this);
        }
        get isActive() {
            const { theme, activeTheme } = this.props;
            return theme?.data?.name === activeTheme || theme?.native === activeTheme;
        }
        get bIsThemeConfigurable() {
            const { theme } = this.props;
            return theme?.data?.Conditions !== undefined || theme?.data?.RootColors !== undefined;
        }
        openThemeSettings() {
            const { theme } = this.props;
            const isActive = this.isActive;
            function onClose() {
                if (!isActive || !window.PLUGIN_LIST[pluginName].ConditionConfigHasChanged)
                    return;
                /** After the new config is set, we need to reload the UI for changes to be reflected */
                Utils.PromptReload(() => SteamClient.Browser.RestartJSContext());
                window.PLUGIN_LIST[pluginName].ConditionConfigHasChanged = false;
            }
            client.showModal(jsxRuntime.jsx(RenderThemeEditor, { theme: theme }), window.PLUGIN_LIST[pluginName].mainWindow, {
                strTitle: theme?.data?.name,
                popupHeight: 675,
                popupWidth: 850,
                fnOnClose: onClose,
            });
        }
        openThemeFolder() {
            const { theme } = this.props;
            const themesPath = [window.PLUGIN_LIST[pluginName].steamPath, 'steamui', 'skins', theme.native].join('/');
            Utils.BrowseLocalFolder(themesPath);
        }
        async uninstallTheme() {
            const { theme, fetchThemes } = this.props;
            const shouldUninstall = await Utils.ShowMessageBox(`Are you sure you want to uninstall ${theme.data.name}?`, 'Heads up!');
            if (!shouldUninstall)
                return;
            PyUninstallTheme({ owner: theme.data.github.owner, repo: theme.data.github.repo_name }).then(() => {
                if (this.isActive) {
                    SteamClient.Browser.RestartJSContext();
                }
                else {
                    fetchThemes();
                }
            });
        }
        showCtxMenu(e) {
            const { theme, onChangeTheme, onUseDefault } = this.props;
            const { shouldShowMore } = this.state;
            const isActive = this.isActive;
            console.log('Menu', client.Menu);
            client.showContextMenu(jsxRuntime.jsxs(client.Menu, { label: theme?.data?.name, children: [jsxRuntime.jsxs(client.MenuItem, { disabled: true, tone: "emphasis", bInteractableItem: false, children: [theme?.data?.name, " ", theme?.data?.version && jsxRuntime.jsxs(jsxRuntime.Fragment, { children: ["v", theme.data.version] })] }), jsxRuntime.jsx(Separator, {}), isActive ? jsxRuntime.jsx(client.MenuItem, { onSelected: onUseDefault, children: "Disable" }) : jsxRuntime.jsx(client.MenuItem, { onSelected: () => onChangeTheme(theme), children: "Set as active" }), jsxRuntime.jsx(client.MenuItem, { onSelected: this.openThemeSettings.bind(this), disabled: !this.bIsThemeConfigurable, children: "Configure" }), jsxRuntime.jsx(client.MenuItem, { onSelected: () => this.setState({ shouldShowMore: !shouldShowMore }), children: shouldShowMore ? 'Show less...' : 'Show more...' }), jsxRuntime.jsx(client.MenuItem, { onSelected: this.openThemeFolder.bind(this), children: "Browse local files" }), jsxRuntime.jsx(client.MenuItem, { onSelected: this.uninstallTheme.bind(this), children: "Uninstall" })] }), e.currentTarget ?? window);
        }
        renderExpandableShowMore() {
            const { theme } = this.props;
            if (!theme?.data?.description && !theme?.data?.github?.owner)
                return null;
            return (jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [theme.data.description && jsxRuntime.jsx("div", { className: "MillenniumThemes_Description", children: theme.data.description }), theme.data.github?.owner && (jsxRuntime.jsx("a", { className: "MillenniumThemes_Author", onClick: () => Utils.OpenUrl('https://github.com/' + theme.data.github.owner), children: formatString(locale.strByAuthor, theme.data.github.owner) }))] }));
        }
        render() {
            const { theme, isLastItem } = this.props;
            const { shouldShowMore } = this.state;
            const isActive = this.isActive;
            return (jsxRuntime.jsxs(client.Field, { label: jsxRuntime.jsxs("div", { className: "MillenniumThemes_ThemeLabel", children: [theme?.data?.name, theme?.data?.version && jsxRuntime.jsxs("div", { className: "MillenniumItem_Version", children: ["v", theme.data.version] })] }), padding: "standard", bottomSeparator: isLastItem ? 'none' : 'standard', className: "MillenniumThemes_ThemeItem", ...(isActive && { icon: jsxRuntime.jsx(FaCheck, {}) }), ...(shouldShowMore && { description: this.renderExpandableShowMore() }), "data-theme-name": theme?.data?.name, "data-theme-folder-name-on-disk": theme?.native, children: [shouldShowMore && theme?.data?.funding?.kofi && (jsxRuntime.jsx(IconButton, { onClick: () => Utils.OpenUrl('https://ko-fi.com/' + theme.data.funding.kofi), children: jsxRuntime.jsx(SiKofi, {}) })), jsxRuntime.jsx(IconButton, { onClick: this.showCtxMenu, children: jsxRuntime.jsx(FaEllipsisH, {}) })] }));
        }
    }

    var FindThemeIdGif = "743950167cf26eea.gif";

    /**
     * ==================================================
     *   _____ _ _ _             _
     *  |     |_| | |___ ___ ___|_|_ _ _____
     *  | | | | | | | -_|   |   | | | |     |
     *  |_|_|_|_|_|_|___|_|_|_|_|_|___|_|_|_|
     *
     * ==================================================
     *
     * Copyright (c) 2025 Project Digitaldepot
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in all
     * copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     * SOFTWARE.
     */
    const API_URL = 'https://steambrew.app';
    const PLUGINS_URL = [API_URL, 'plugins'].join('/');
    const THEMES_URL = [API_URL, 'themes'].join('/');
    const getPluginView = (pluginName) => getPluginRenderers()?.[pluginName];
    function getPluginRenderers() {
        if (typeof window?.Digitaldepot_SIDEBAR_NAVIGATION_PANELS === 'undefined') {
            return {};
        }
        return window?.Digitaldepot_SIDEBAR_NAVIGATION_PANELS;
    }

    const OnInstallComplete$1 = (data, props) => {
        const UseNewTheme = async () => {
            try {
                const themeData = JSON.parse(await PyGetThemeInfo({ repo: data?.skin_data?.github?.repo_name, owner: data?.skin_data?.github?.owner, asString: true }));
                ChangeActiveTheme(themeData?.native, UIReloadProps.Force);
            }
            catch (error) {
                console.error('Error finding theme on disk:', error);
            }
        };
        /** Refetch theme data after installation */
        props?.refetchDataCb();
        return (jsxRuntime.jsx(client.ConfirmModal, { strTitle: locale.strInstallComplete, strDescription: formatString(locale.strSuccessfulInstall, data?.name ?? locale.strUnknown), bHideCloseIcon: true, strOKButtonText: locale.strUseThemeRequiresReload, onOK: () => {
                // ChangeActiveTheme(data.name, UIReloadProps.Force);
                UseNewTheme();
                props?.modal?.Close?.();
            }, onCancel: () => {
                props?.modal?.Close?.();
            } }));
    };
    const OnProgressUpdate$1 = ({ progress, status }) => {
        const RenderBody = () => {
            return (jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [jsxRuntime.jsx(Styles, {}), jsxRuntime.jsx(client.ProgressBarWithInfo
                    /* @ts-ignore */
                    , { 
                        /* @ts-ignore */
                        className: "MillenniumInstallerDialog_ProgressBar", sOperationText: status, nProgress: progress, nTransitionSec: 0.5 }, `installer-progress-${progress}`)] }));
        };
        return (jsxRuntime.jsx(client.ConfirmModal, { className: "MillenniumInstallerDialog", strTitle: locale.strInstallProgress, strDescription: jsxRuntime.jsx(RenderBody, {}), bHideCloseIcon: true, onCancel: () => { }, bAlertDialog: true, bCancelDisabled: true, bDisableBackgroundDismiss: true }));
    };
    const StartThemeInstaller = async (data, props) => {
        const theme = data?.skin_data;
        const owner = theme?.github?.owner;
        const repo = theme?.github?.repo_name;
        const isInstalled = await PyIsThemeInstalled({ owner, repo });
        const { ShowMessageBox } = props;
        const UninstallTheme = (resolve) => {
            PyUninstallTheme({ repo, owner }).then((result) => {
                const response = JSON.parse(result);
                if (!response || !response?.success) {
                    ShowMessageBox(formatString(locale.errorFailedToUninstallTheme, response?.message ?? locale.strUnknown), locale.errorMessageTitle);
                    resolve(false);
                }
                resolve(true);
            });
        };
        if (isInstalled) {
            const shouldContinueInstall = await new Promise((resolve) => {
                ShowMessageBox(locale.warningThemeAlreadyInstalled, locale.warningConflictingFiles, {
                    strCancelButtonText: locale.strNeverMind,
                    strOKButtonText: locale.strReinstall,
                    onOK: UninstallTheme.bind(null, resolve),
                    onCancel: () => {
                        resolve(false);
                        props?.modal?.Close?.();
                    },
                });
            });
            if (!shouldContinueInstall) {
                return false;
            }
        }
        /** Run installer in the background */
        PyInstallTheme({ repo, owner }).then((result) => {
            !result && ShowMessageBox(locale.errorFailedToStartThemeInstaller, locale.errorMessageTitle);
        });
        return {
            onInstallComplete: OnInstallComplete$1.bind(null, data, props),
            onProgressUpdate: OnProgressUpdate$1,
        };
    };

    const OnInstallComplete = (data, props) => {
        const EnablePlugin = async () => {
            await PyUpdatePluginStatus({ pluginJson: JSON.stringify([{ plugin_name: data?.pluginJson?.name, enabled: true }]) });
        };
        /** Refetch plugin data after installation */
        props?.refetchDataCb();
        return (jsxRuntime.jsx(client.ConfirmModal, { strTitle: locale.strInstallComplete, strDescription: formatString(locale.strSuccessfulInstall, data?.pluginJson?.common_name ?? locale.strUnknown), bHideCloseIcon: true, strOKButtonText: locale.strEnablePlugin, onOK: () => {
                EnablePlugin();
                props?.modal?.Close?.();
            }, onCancel: () => {
                props?.modal?.Close?.();
            } }));
    };
    const OnProgressUpdate = ({ progress, status }) => {
        const RenderBody = () => {
            return (jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [jsxRuntime.jsx(Styles, {}), jsxRuntime.jsx(client.ProgressBarWithInfo
                    /* @ts-ignore */
                    , { 
                        /* @ts-ignore */
                        className: "MillenniumInstallerDialog_ProgressBar", sOperationText: status, nProgress: progress, nTransitionSec: 0.5 }, `installer-progress-${progress}`)] }));
        };
        return (jsxRuntime.jsx(client.ConfirmModal, { className: "MillenniumInstallerDialog", strTitle: locale.strInstallProgress, strDescription: jsxRuntime.jsx(RenderBody, {}), bHideCloseIcon: true, onCancel: () => { }, bAlertDialog: true, bCancelDisabled: true, bDisableBackgroundDismiss: true, bOKDisabled: true }));
    };
    const StartPluginInstaller = async (data, props) => {
        /** Plugin build is failing */
        if (!data?.hasValidBuild) {
            props?.ShowMessageBox(locale.strInvalidPluginBuildMessage, locale.strInvalidPluginBuild);
            return false;
        }
        const isInstalled = await PyIsPluginInstalled({ plugin_name: data?.pluginJson?.name });
        if (isInstalled) {
            props?.ShowMessageBox(formatString(locale.strAlreadyInPluginLibrary, data?.pluginJson?.common_name ?? locale.strUnknown), locale.strAlreadyInstalled, {
                bAlertDialog: true,
                onOK: () => {
                    props?.modal?.Close?.();
                },
            });
            return false;
        }
        const downloadUrl = API_URL + data?.downloadUrl;
        PyInstallPlugin({ download_url: downloadUrl, total_size: data?.fileSize }).then((result) => {
            try {
                const jsonResponse = JSON.parse(result);
                if (!jsonResponse?.success) {
                    throw new Error(jsonResponse?.message);
                }
            }
            catch (error) {
                props?.ShowMessageBox(formatString(locale.errorFailedToDownloadPlugin, error), locale.errorMessageTitle);
            }
        });
        return {
            onInstallComplete: OnInstallComplete.spread(data, props),
            onProgressUpdate: OnProgressUpdate,
        };
    };

    async function IncrementThemeDownloadFromId(id) {
        try {
            const response = await fetch(`${API_URL}/api/bump/theme/${id}`);
            if (!response.ok) {
                Logger.Error('Failed to bump theme downloads');
                return;
            }
            const responseJson = await response.json();
            if (!responseJson?.success) {
                Logger.Error('Failed to bump theme downloads:', responseJson?.message || 'Unknown error');
                return;
            }
            else {
                Logger.Log('Theme downloads bumped successfully');
            }
        }
        catch (error) {
            Logger.Error('Error bumping theme downloads:', error);
        }
    }
    async function IncrementPluginDownloadFromId(id) {
        try {
            const response = await fetch(`${API_URL}/api/bump/plugin/${id}`);
            if (!response.ok) {
                Logger.Error('Failed to bump plugin downloads');
                return;
            }
            const responseJson = await response.json();
            if (!responseJson?.success) {
                Logger.Error('Failed to bump plugin downloads:', responseJson?.message || 'Unknown error');
                return;
            }
            else {
                Logger.Log('Plugin downloads bumped successfully');
            }
        }
        catch (error) {
            Logger.Error('Error bumping plugin downloads:', error);
        }
    }

    var InstallType;
    (function (InstallType) {
        InstallType[InstallType["Plugin"] = 0] = "Plugin";
        InstallType[InstallType["Theme"] = 1] = "Theme";
    })(InstallType || (InstallType = {}));
    function InstallerMessageEmitter(message) {
        try {
            const { status, progress, isComplete } = JSON.parse(message);
            if (!window.PLUGIN_LIST[pluginName].InstallerEventEmitter) {
                return;
            }
            window.PLUGIN_LIST[pluginName].InstallerEventEmitter({
                progress,
                status,
                isComplete,
            });
        }
        catch (error) {
            console.error('Failed to parse message:', error);
        }
    }
    client.Millennium.exposeObj(exports, { InstallerMessageEmitter });
    class Installer {
        async FetchPluginInfo(id) {
            try {
                const response = await fetch(`${API_URL}/api/v1/plugin/${id}`);
                if (!response.ok) {
                    const errorText = await response.text().catch(() => '');
                    throw new Error(`${locale.errorFailedToFetchPlugin}${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ''}`);
                }
                const pluginInfo = await response.json();
                return pluginInfo;
            }
            catch (error) {
                throw new Error(locale.errorFailedToFetchPlugin + error.message);
            }
        }
        async FetchThemeInfo(id) {
            try {
                const response = await fetch(`${API_URL}/api/v2/details/${id}`);
                if (!response.ok) {
                    const errorText = await response.text().catch(() => '');
                    throw new Error(`${locale.errorFailedToFetchTheme}${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ''}`);
                }
                const themeInfo = await response.json();
                return themeInfo;
            }
            catch (error) {
                throw new Error(locale.errorFailedToFetchTheme + error.message);
            }
        }
        async FetchInformationFromId(id) {
            if (!id) {
                throw new Error(locale.errorInvalidID);
            }
            switch (id.length) {
                case 20:
                    return { type: InstallType.Theme, data: await this.FetchThemeInfo(id) };
                case 12:
                    return { type: InstallType.Plugin, data: await this.FetchPluginInfo(id) };
                default:
                    throw new Error(locale.errorInvalidID);
            }
        }
        async PromptInstallation(type, data) {
            const itemName = (type === InstallType.Plugin ? data?.pluginJson?.common_name : data?.name) ?? locale.strUnknown;
            return new Promise((resolve) => {
                let modal;
                const Renderer = () => {
                    const [element, setElement] = React.useState(jsxRuntime.jsx(client.ConfirmModal, { strTitle: itemName, strDescription: locale.warnProceedInstallation, onOK: resolve.bind(null, modal), bHideCloseIcon: true, closeModal: () => { }, onCancel: modal?.Close }));
                    React.useEffect(() => {
                        setElement && (window.PLUGIN_LIST[pluginName].UpdateInstallerState = setElement);
                    }, []);
                    return element;
                };
                modal = client.showModal(jsxRuntime.jsx(Renderer, {}), window.PLUGIN_LIST[pluginName].mainWindow, {
                    bNeverPopOut: true,
                    popupWidth: 500,
                    popupHeight: 275,
                });
            });
        }
        async OpenInstallPrompt(id, refetchDataCb) {
            let modal;
            let renderProps;
            function ShowMessageBox(message, title, props) {
                return new Promise((resolve) => {
                    const handle = (result, cb) => {
                        cb?.();
                        resolve(result);
                    };
                    const element = (jsxRuntime.jsx(client.ConfirmModal, { ...props, strTitle: title, strDescription: message, bHideCloseIcon: true, onOK: handle.bind(null, true, props?.onOK), onCancel: handle.bind(null, false, props?.onCancel) }));
                    if (window.PLUGIN_LIST[pluginName]?.UpdateInstallerState) {
                        window.PLUGIN_LIST[pluginName].UpdateInstallerState(element);
                    }
                    else {
                        client.showModal(element, window.PLUGIN_LIST[pluginName].mainWindow, {
                            bNeverPopOut: true,
                            popupWidth: 500,
                            popupHeight: 275,
                        });
                    }
                });
            }
            function OnInstallComplete() {
                window.PLUGIN_LIST[pluginName].UpdateInstallerState(renderProps.onInstallComplete());
            }
            function RenderInstallerProgress() {
                const [event, setEvent] = React.useState(null);
                React.useEffect(() => {
                    setEvent && (window.PLUGIN_LIST[pluginName].InstallerEventEmitter = setEvent);
                }, []);
                React.useEffect(() => {
                    event?.isComplete && setTimeout(() => OnInstallComplete(), 1000);
                }, [event]);
                return jsxRuntime.jsx(renderProps.onProgressUpdate, { progress: event?.progress ?? 0, status: event?.status ?? locale.strUnknown });
            }
            try {
                const { type, data } = await this.FetchInformationFromId(id);
                modal = await this.PromptInstallation(type, data);
                switch (type) {
                    case InstallType.Plugin: {
                        Logger.Log(`Installing plugin with ID: ${id}`);
                        IncrementPluginDownloadFromId(id);
                        const result = await StartPluginInstaller(data, { updateInstallerState: window.PLUGIN_LIST[pluginName].UpdateInstallerState, ShowMessageBox, modal, refetchDataCb });
                        if (!result)
                            return;
                        renderProps = result;
                        break;
                    }
                    case InstallType.Theme: {
                        Logger.Log(`Installing theme with ID: ${id}`);
                        IncrementThemeDownloadFromId(id);
                        const result = await StartThemeInstaller(data, { updateInstallerState: window.PLUGIN_LIST[pluginName].UpdateInstallerState, ShowMessageBox, modal, refetchDataCb });
                        if (!result)
                            return;
                        renderProps = result;
                        break;
                    }
                }
                window.PLUGIN_LIST[pluginName].UpdateInstallerState(jsxRuntime.jsx(RenderInstallerProgress, {}));
            }
            catch (error) {
                ShowMessageBox(error.message, locale.errorMessageTitle);
            }
        }
    }

    function ThemeIdModal({ tutorialImageUrl, installer, modal, refetchDataCb }) {
        const [installID, setInstallID] = React.useState(String());
        return (jsxRuntime.jsx(client.ConfirmModal, { strTitle: "Enter an ID", strDescription: jsxRuntime.jsxs(jsxRuntime.Fragment, { children: ["Install a user theme from an ID. These ID's can be found after selecting a theme at ", jsxRuntime.jsx(Utils.URLComponent, { url: THEMES_URL }), jsxRuntime.jsx(client.SuspensefulImage, { className: "MillenniumInstallDialog_TutorialImage", src: tutorialImageUrl }), jsxRuntime.jsx(client.TextField
                    // @ts-ignore
                    , { 
                        // @ts-ignore
                        placeholder: 'Enter an ID here...', value: installID, onChange: (e) => setInstallID(e.target.value) })] }), bHideCloseIcon: true, onOK: () => {
                installer.OpenInstallPrompt(installID, refetchDataCb);
                modal?.Close();
            }, onCancel: () => {
                modal?.Close();
            }, strOKButtonText: "Install" }));
    }
    async function cacheImage$1(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.referrerPolicy = 'origin';
            img.src = url;
            img.onload = () => resolve(img);
            img.onerror = (err) => reject(err);
        });
    }
    async function showInstallThemeModal(refetchDataCb) {
        let modal;
        const tutorialImageUrl = [await Utils.GetPluginAssetUrl(), FindThemeIdGif].join('/');
        const installer = new Installer();
        await cacheImage$1(tutorialImageUrl);
        const WrappedModal = () => {
            const [modalInstance, setModalInstance] = React.useState(null);
            React.useEffect(() => {
                setModalInstance(modal);
            }, []);
            return jsxRuntime.jsx(ThemeIdModal, { refetchDataCb: refetchDataCb, tutorialImageUrl: tutorialImageUrl, installer: installer, modal: modalInstance });
        };
        modal = client.showModal(jsxRuntime.jsx(WrappedModal, {}), window.PLUGIN_LIST[pluginName].mainWindow, {
            bNeverPopOut: true,
            popupHeight: 650,
            popupWidth: 750,
        });
    }

    const findAllThemes = async () => {
        return JSON.parse(await PyFindAllThemes());
    };
    class ThemeViewModal extends React.Component {
        constructor(props) {
            super(props);
            this.UseDefaultTheme = () => {
                /** Default theme object */
                this.ChangeActiveTheme({ native: 'default', data: null, failed: false });
            };
            this.ChangeActiveTheme = (item) => {
                ChangeActiveTheme(item.native, UIReloadProps.Prompt).then((hasClickedOk) => {
                    /** Reload the themes */
                    !hasClickedOk && findAllThemes().then((themes) => this.setState({ themes }));
                });
            };
            this.IsActiveTheme = (theme) => {
                const { active } = this.state;
                return theme?.data?.name === active || theme?.native === active;
            };
            this.RenderThemeItem = (theme, isLastItem, index) => {
                return (jsxRuntime.jsx(ThemeItemComponent, { theme: theme, isLastItem: isLastItem, activeTheme: this.state.active, onChangeTheme: this.ChangeActiveTheme, onUseDefault: this.UseDefaultTheme, fetchThemes: this.FetchAllPlugins.bind(this) }, index));
            };
            this.FetchAllPlugins = () => {
                findAllThemes().then((themes) => {
                    this.setState({ themes });
                });
            };
            this.OpenThemesFolder = () => {
                const themesPath = [window.PLUGIN_LIST[pluginName].steamPath, 'steamui', 'skins'].join('/');
                Utils.BrowseLocalFolder(themesPath);
            };
            this.InstallPluginMenu = () => {
                showInstallThemeModal(this.FetchAllPlugins);
            };
            this.state = {
                themes: undefined,
                active: undefined,
            };
        }
        componentDidMount() {
            const activeTheme = window.PLUGIN_LIST[pluginName].activeTheme;
            const active = window.PLUGIN_LIST[pluginName].isDefaultTheme ? 'Default' : activeTheme?.data?.name ?? activeTheme?.native;
            this.setState({ active });
            this.FetchAllPlugins();
        }
        render() {
            if (window.PLUGIN_LIST[pluginName].connectionFailed) {
                return (jsxRuntime.jsx(Placeholder, { icon: jsxRuntime.jsx(client.IconsModule.ExclamationPoint, {}), header: locale.errorFailedConnection, body: locale.errorFailedConnectionBody, children: jsxRuntime.jsx(client.DialogButton, { className: settingsClasses.SettingsDialogButton, onClick: () => SteamClient.System.OpenLocalDirectoryInSystemExplorer([window.PLUGIN_LIST[pluginName].steamPath, 'ext', 'data', 'logs'].join('/')), children: locale.errorFailedConnectionButton }) }));
            }
            /** Haven't received the themes yet from the backend */
            if (this.state.themes === undefined) {
                return null;
            }
            if (!this.state.themes || !this.state.themes.length) {
                return (jsxRuntime.jsxs(Placeholder, { icon: jsxRuntime.jsx(FaPaintRoller, { className: "SVGIcon_Button" }), header: "No themes found", body: "It appears you don't have any themes yet!", children: [jsxRuntime.jsxs(client.DialogButton, { className: client.joinClassNames(settingsClasses.SettingsDialogButton, 'MillenniumPlaceholder_Button'), onClick: this.InstallPluginMenu.bind(this), children: [jsxRuntime.jsx(FaStore, {}), locale.optionInstallTheme] }), jsxRuntime.jsxs(client.DialogButton, { className: client.joinClassNames(settingsClasses.SettingsDialogButton, 'MillenniumPlaceholder_Button'), onClick: this.OpenThemesFolder, children: [jsxRuntime.jsx(FaFolderOpen, {}), locale.optionBrowseLocalFiles] })] }));
            }
            const { themes } = this.state;
            return (jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [jsxRuntime.jsxs(client.DialogControlsSection, { className: "MillenniumButtonsSection", children: [jsxRuntime.jsxs(client.DialogButton, { className: `MillenniumButton ${settingsClasses.SettingsDialogButton}`, onClick: this.InstallPluginMenu.bind(this), children: [jsxRuntime.jsx(FaStore, {}), locale.optionInstallTheme] }), jsxRuntime.jsxs(client.DialogButton, { className: `MillenniumButton ${settingsClasses.SettingsDialogButton}`, onClick: this.OpenThemesFolder, children: [jsxRuntime.jsx(FaFolderOpen, {}), locale.optionBrowseLocalFiles] })] }), themes?.map((theme, i) => this.RenderThemeItem(theme, i === themes.length - 1, i))] }));
        }
    }

    // THIS FILE IS AUTO GENERATED
    function PiPlugsFill (props) {
      return GenIcon({"attr":{"viewBox":"0 0 256 256","fill":"currentColor"},"child":[{"tag":"path","attr":{"d":"M149.66,149.66,131.31,168l18.35,18.34a8,8,0,0,1-11.32,11.32L132,191.31l-23.31,23.32a32.06,32.06,0,0,1-45.26,0l-5.37-5.38-28.4,28.41a8,8,0,0,1-11.32-11.32l28.41-28.4-5.38-5.37a32,32,0,0,1,0-45.26L64.69,124l-6.35-6.34a8,8,0,0,1,11.32-11.32L88,124.69l18.34-18.35a8,8,0,0,1,11.32,11.32L99.31,136,120,156.69l18.34-18.35a8,8,0,0,1,11.32,11.32Zm88-131.32a8,8,0,0,0-11.32,0l-28.4,28.41-5.37-5.38a32.05,32.05,0,0,0-45.26,0L124,64.69l-6.34-6.35a8,8,0,0,0-11.32,11.32l80,80a8,8,0,0,0,11.32-11.32L191.31,132l23.32-23.31a32,32,0,0,0,0-45.26l-5.38-5.37,28.41-28.4A8,8,0,0,0,237.66,18.34Z"},"child":[]}]})(props);
    }

    var FindPluginIdGif = "93d52991f36a5a46.gif";

    function PluginIdModal({ tutorialImageUrl, installer, modal, refetchDataCb }) {
        const [installID, setInstallID] = React.useState(String());
        return (jsxRuntime.jsx(client.ConfirmModal, { strTitle: "Enter an ID", strDescription: jsxRuntime.jsxs(jsxRuntime.Fragment, { children: ["Install a user plugin from an ID. These ID's can be found after selecting a plugin at ", jsxRuntime.jsx(Utils.URLComponent, { url: PLUGINS_URL }), jsxRuntime.jsx(client.SuspensefulImage, { className: "MillenniumInstallDialog_TutorialImage", src: tutorialImageUrl }), jsxRuntime.jsx(client.TextField
                    // @ts-ignore
                    , { 
                        // @ts-ignore
                        placeholder: 'Enter an ID here...', value: installID, onChange: (e) => setInstallID(e.target.value) })] }), bHideCloseIcon: true, onOK: () => {
                installer.OpenInstallPrompt(installID, refetchDataCb);
                modal?.Close();
            }, onCancel: () => {
                modal?.Close();
            }, strOKButtonText: "Install" }));
    }
    async function cacheImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = url;
            img.onload = () => resolve(img);
            img.onerror = (err) => reject(err);
        });
    }
    async function showInstallPluginModal(refetchDataCb) {
        let modal;
        const tutorialImageUrl = [await Utils.GetPluginAssetUrl(), FindPluginIdGif].join('/');
        const installer = new Installer();
        await cacheImage(tutorialImageUrl);
        const WrappedModal = () => {
            const [modalInstance, setModalInstance] = React.useState(null);
            React.useEffect(() => {
                setModalInstance(modal);
            }, []);
            return jsxRuntime.jsx(PluginIdModal, { refetchDataCb: refetchDataCb, tutorialImageUrl: tutorialImageUrl, installer: installer, modal: modalInstance });
        };
        modal = client.showModal(jsxRuntime.jsx(WrappedModal, {}), window.PLUGIN_LIST[pluginName].mainWindow, {
            bNeverPopOut: true,
            popupHeight: 650,
            popupWidth: 750,
        });
    }

    function getDefaultExportFromCjs (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

    var lib$1 = {};

    var lib;
    var hasRequiredLib$1;

    function requireLib$1 () {
    	if (hasRequiredLib$1) return lib;
    	hasRequiredLib$1 = 1;

    	// This file was originally written by @drudru (https://github.com/drudru/ansi_up), MIT, 2011

    	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    	var ANSI_COLORS = [[{ color: "0, 0, 0", "class": "ansi-black" }, { color: "187, 0, 0", "class": "ansi-red" }, { color: "0, 187, 0", "class": "ansi-green" }, { color: "187, 187, 0", "class": "ansi-yellow" }, { color: "0, 0, 187", "class": "ansi-blue" }, { color: "187, 0, 187", "class": "ansi-magenta" }, { color: "0, 187, 187", "class": "ansi-cyan" }, { color: "255,255,255", "class": "ansi-white" }], [{ color: "85, 85, 85", "class": "ansi-bright-black" }, { color: "255, 85, 85", "class": "ansi-bright-red" }, { color: "0, 255, 0", "class": "ansi-bright-green" }, { color: "255, 255, 85", "class": "ansi-bright-yellow" }, { color: "85, 85, 255", "class": "ansi-bright-blue" }, { color: "255, 85, 255", "class": "ansi-bright-magenta" }, { color: "85, 255, 255", "class": "ansi-bright-cyan" }, { color: "255, 255, 255", "class": "ansi-bright-white" }]];

    	var Anser = function () {
    	    _createClass(Anser, null, [{
    	        key: "escapeForHtml",


    	        /**
    	         * Anser.escapeForHtml
    	         * Escape the input HTML.
    	         *
    	         * This does the minimum escaping of text to make it compliant with HTML.
    	         * In particular, the '&','<', and '>' characters are escaped. This should
    	         * be run prior to `ansiToHtml`.
    	         *
    	         * @name Anser.escapeForHtml
    	         * @function
    	         * @param {String} txt The input text (containing the ANSI snippets).
    	         * @returns {String} The escaped html.
    	         */
    	        value: function escapeForHtml(txt) {
    	            return new Anser().escapeForHtml(txt);
    	        }

    	        /**
    	         * Anser.linkify
    	         * Adds the links in the HTML.
    	         *
    	         * This replaces any links in the text with anchor tags that display the
    	         * link. The links should have at least one whitespace character
    	         * surrounding it. Also, you should apply this after you have run
    	         * `ansiToHtml` on the text.
    	         *
    	         * @name Anser.linkify
    	         * @function
    	         * @param {String} txt The input text.
    	         * @returns {String} The HTML containing the <a> tags (unescaped).
    	         */

    	    }, {
    	        key: "linkify",
    	        value: function linkify(txt) {
    	            return new Anser().linkify(txt);
    	        }

    	        /**
    	         * Anser.ansiToHtml
    	         * This replaces ANSI terminal escape codes with SPAN tags that wrap the
    	         * content.
    	         *
    	         * This function only interprets ANSI SGR (Select Graphic Rendition) codes
    	         * that can be represented in HTML.
    	         * For example, cursor movement codes are ignored and hidden from output.
    	         * The default style uses colors that are very close to the prescribed
    	         * standard. The standard assumes that the text will have a black
    	         * background. These colors are set as inline styles on the SPAN tags.
    	         *
    	         * Another option is to set `use_classes: true` in the options argument.
    	         * This will instead set classes on the spans so the colors can be set via
    	         * CSS. The class names used are of the format `ansi-*-fg/bg` and
    	         * `ansi-bright-*-fg/bg` where `*` is the color name,
    	         * i.e black/red/green/yellow/blue/magenta/cyan/white.
    	         *
    	         * @name Anser.ansiToHtml
    	         * @function
    	         * @param {String} txt The input text.
    	         * @param {Object} options The options passed to the ansiToHTML method.
    	         * @returns {String} The HTML output.
    	         */

    	    }, {
    	        key: "ansiToHtml",
    	        value: function ansiToHtml(txt, options) {
    	            return new Anser().ansiToHtml(txt, options);
    	        }

    	        /**
    	         * Anser.ansiToJson
    	         * Converts ANSI input into JSON output.
    	         *
    	         * @name Anser.ansiToJson
    	         * @function
    	         * @param {String} txt The input text.
    	         * @param {Object} options The options passed to the ansiToHTML method.
    	         * @returns {String} The HTML output.
    	         */

    	    }, {
    	        key: "ansiToJson",
    	        value: function ansiToJson(txt, options) {
    	            return new Anser().ansiToJson(txt, options);
    	        }

    	        /**
    	         * Anser.ansiToText
    	         * Converts ANSI input into text output.
    	         *
    	         * @name Anser.ansiToText
    	         * @function
    	         * @param {String} txt The input text.
    	         * @returns {String} The text output.
    	         */

    	    }, {
    	        key: "ansiToText",
    	        value: function ansiToText(txt) {
    	            return new Anser().ansiToText(txt);
    	        }

    	        /**
    	         * Anser
    	         * The `Anser` class.
    	         *
    	         * @name Anser
    	         * @function
    	         * @returns {Anser}
    	         */

    	    }]);

    	    function Anser() {
    	        _classCallCheck(this, Anser);

    	        this.fg = this.bg = this.fg_truecolor = this.bg_truecolor = null;
    	        this.bright = 0;
    	    }

    	    /**
    	     * setupPalette
    	     * Sets up the palette.
    	     *
    	     * @name setupPalette
    	     * @function
    	     */


    	    _createClass(Anser, [{
    	        key: "setupPalette",
    	        value: function setupPalette() {
    	            this.PALETTE_COLORS = [];

    	            // Index 0..15 : System color
    	            for (var i = 0; i < 2; ++i) {
    	                for (var j = 0; j < 8; ++j) {
    	                    this.PALETTE_COLORS.push(ANSI_COLORS[i][j].color);
    	                }
    	            }

    	            // Index 16..231 : RGB 6x6x6
    	            // https://gist.github.com/jasonm23/2868981#file-xterm-256color-yaml
    	            var levels = [0, 95, 135, 175, 215, 255];
    	            var format = function format(r, g, b) {
    	                return levels[r] + ", " + levels[g] + ", " + levels[b];
    	            };
    	            for (var _r = 0; _r < 6; ++_r) {
    	                for (var _g = 0; _g < 6; ++_g) {
    	                    for (var _b = 0; _b < 6; ++_b) {
    	                        this.PALETTE_COLORS.push(format(_r, _g, _b));
    	                    }
    	                }
    	            }

    	            // Index 232..255 : Grayscale
    	            var level = 8;
    	            for (var _i = 0; _i < 24; ++_i, level += 10) {
    	                this.PALETTE_COLORS.push(format(level, level, level));
    	            }
    	        }

    	        /**
    	         * escapeForHtml
    	         * Escapes the input text.
    	         *
    	         * @name escapeForHtml
    	         * @function
    	         * @param {String} txt The input text.
    	         * @returns {String} The escpaed HTML output.
    	         */

    	    }, {
    	        key: "escapeForHtml",
    	        value: function escapeForHtml(txt) {
    	            return txt.replace(/[&<>]/gm, function (str) {
    	                return str == "&" ? "&amp;" : str == "<" ? "&lt;" : str == ">" ? "&gt;" : "";
    	            });
    	        }

    	        /**
    	         * linkify
    	         * Adds HTML link elements.
    	         *
    	         * @name linkify
    	         * @function
    	         * @param {String} txt The input text.
    	         * @returns {String} The HTML output containing link elements.
    	         */

    	    }, {
    	        key: "linkify",
    	        value: function linkify(txt) {
    	            return txt.replace(/(https?:\/\/[^\s]+)/gm, function (str) {
    	                return "<a href=\"" + str + "\">" + str + "</a>";
    	            });
    	        }

    	        /**
    	         * ansiToHtml
    	         * Converts ANSI input into HTML output.
    	         *
    	         * @name ansiToHtml
    	         * @function
    	         * @param {String} txt The input text.
    	         * @param {Object} options The options passed ot the `process` method.
    	         * @returns {String} The HTML output.
    	         */

    	    }, {
    	        key: "ansiToHtml",
    	        value: function ansiToHtml(txt, options) {
    	            return this.process(txt, options, true);
    	        }

    	        /**
    	         * ansiToJson
    	         * Converts ANSI input into HTML output.
    	         *
    	         * @name ansiToJson
    	         * @function
    	         * @param {String} txt The input text.
    	         * @param {Object} options The options passed ot the `process` method.
    	         * @returns {String} The JSON output.
    	         */

    	    }, {
    	        key: "ansiToJson",
    	        value: function ansiToJson(txt, options) {
    	            options = options || {};
    	            options.json = true;
    	            options.clearLine = false;
    	            return this.process(txt, options, true);
    	        }

    	        /**
    	         * ansiToText
    	         * Converts ANSI input into HTML output.
    	         *
    	         * @name ansiToText
    	         * @function
    	         * @param {String} txt The input text.
    	         * @returns {String} The text output.
    	         */

    	    }, {
    	        key: "ansiToText",
    	        value: function ansiToText(txt) {
    	            return this.process(txt, {}, false);
    	        }

    	        /**
    	         * process
    	         * Processes the input.
    	         *
    	         * @name process
    	         * @function
    	         * @param {String} txt The input text.
    	         * @param {Object} options An object passed to `processChunk` method, extended with:
    	         *
    	         *  - `json` (Boolean): If `true`, the result will be an object.
    	         *  - `use_classes` (Boolean): If `true`, HTML classes will be appended to the HTML output.
    	         *
    	         * @param {Boolean} markup
    	         */

    	    }, {
    	        key: "process",
    	        value: function process(txt, options, markup) {
    	            var _this = this;

    	            var self = this;
    	            var raw_text_chunks = txt.split(/\033\[/);
    	            var first_chunk = raw_text_chunks.shift(); // the first chunk is not the result of the split

    	            if (options === undefined || options === null) {
    	                options = {};
    	            }
    	            options.clearLine = /\r/.test(txt); // check for Carriage Return
    	            var color_chunks = raw_text_chunks.map(function (chunk) {
    	                return _this.processChunk(chunk, options, markup);
    	            });

    	            if (options && options.json) {
    	                var first = self.processChunkJson("");
    	                first.content = first_chunk;
    	                first.clearLine = options.clearLine;
    	                color_chunks.unshift(first);
    	                if (options.remove_empty) {
    	                    color_chunks = color_chunks.filter(function (c) {
    	                        return !c.isEmpty();
    	                    });
    	                }
    	                return color_chunks;
    	            } else {
    	                color_chunks.unshift(first_chunk);
    	            }

    	            return color_chunks.join("");
    	        }

    	        /**
    	         * processChunkJson
    	         * Processes the current chunk into json output.
    	         *
    	         * @name processChunkJson
    	         * @function
    	         * @param {String} text The input text.
    	         * @param {Object} options An object containing the following fields:
    	         *
    	         *  - `json` (Boolean): If `true`, the result will be an object.
    	         *  - `use_classes` (Boolean): If `true`, HTML classes will be appended to the HTML output.
    	         *
    	         * @param {Boolean} markup If false, the colors will not be parsed.
    	         * @return {Object} The result object:
    	         *
    	         *  - `content` (String): The text.
    	         *  - `fg` (String|null): The foreground color.
    	         *  - `bg` (String|null): The background color.
    	         *  - `fg_truecolor` (String|null): The foreground true color (if 16m color is enabled).
    	         *  - `bg_truecolor` (String|null): The background true color (if 16m color is enabled).
    	         *  - `clearLine` (Boolean): `true` if a carriageReturn \r was fount at end of line.
    	         *  - `was_processed` (Bolean): `true` if the colors were processed, `false` otherwise.
    	         *  - `isEmpty` (Function): A function returning `true` if the content is empty, or `false` otherwise.
    	         *
    	         */

    	    }, {
    	        key: "processChunkJson",
    	        value: function processChunkJson(text, options, markup) {

    	            // Are we using classes or styles?
    	            options = typeof options == "undefined" ? {} : options;
    	            var use_classes = options.use_classes = typeof options.use_classes != "undefined" && options.use_classes;
    	            var key = options.key = use_classes ? "class" : "color";

    	            var result = {
    	                content: text,
    	                fg: null,
    	                bg: null,
    	                fg_truecolor: null,
    	                bg_truecolor: null,
    	                clearLine: options.clearLine,
    	                decoration: null,
    	                was_processed: false,
    	                isEmpty: function isEmpty() {
    	                    return !result.content;
    	                }
    	            };

    	            // Each "chunk" is the text after the CSI (ESC + "[") and before the next CSI/EOF.
    	            //
    	            // This regex matches four groups within a chunk.
    	            //
    	            // The first and third groups match code type.
    	            // We supported only SGR command. It has empty first group and "m" in third.
    	            //
    	            // The second group matches all of the number+semicolon command sequences
    	            // before the "m" (or other trailing) character.
    	            // These are the graphics or SGR commands.
    	            //
    	            // The last group is the text (including newlines) that is colored by
    	            // the other group"s commands.
    	            var matches = text.match(/^([!\x3c-\x3f]*)([\d;]*)([\x20-\x2c]*[\x40-\x7e])([\s\S]*)/m);

    	            if (!matches) return result;

    	            result.content = matches[4];
    	            var nums = matches[2].split(";");

    	            // We currently support only "SGR" (Select Graphic Rendition)
    	            // Simply ignore if not a SGR command.
    	            if (matches[1] !== "" || matches[3] !== "m") {
    	                return result;
    	            }

    	            if (!markup) {
    	                return result;
    	            }

    	            var self = this;

    	            self.decoration = null;

    	            while (nums.length > 0) {
    	                var num_str = nums.shift();
    	                var num = parseInt(num_str);

    	                if (isNaN(num) || num === 0) {
    	                    self.fg = self.bg = self.decoration = null;
    	                } else if (num === 1) {
    	                    self.decoration = "bold";
    	                } else if (num === 2) {
    	                    self.decoration = "dim";
    	                    // Enable code 2 to get string
    	                } else if (num == 3) {
    	                    self.decoration = "italic";
    	                } else if (num == 4) {
    	                    self.decoration = "underline";
    	                } else if (num == 5) {
    	                    self.decoration = "blink";
    	                } else if (num === 7) {
    	                    self.decoration = "reverse";
    	                } else if (num === 8) {
    	                    self.decoration = "hidden";
    	                    // Enable code 9 to get strikethrough
    	                } else if (num === 9) {
    	                    self.decoration = "strikethrough";
    	                } else if (num == 39) {
    	                    self.fg = null;
    	                } else if (num == 49) {
    	                    self.bg = null;
    	                    // Foreground color
    	                } else if (num >= 30 && num < 38) {
    	                    self.fg = ANSI_COLORS[0][num % 10][key];
    	                    // Foreground bright color
    	                } else if (num >= 90 && num < 98) {
    	                    self.fg = ANSI_COLORS[1][num % 10][key];
    	                    // Background color
    	                } else if (num >= 40 && num < 48) {
    	                    self.bg = ANSI_COLORS[0][num % 10][key];
    	                    // Background bright color
    	                } else if (num >= 100 && num < 108) {
    	                    self.bg = ANSI_COLORS[1][num % 10][key];
    	                } else if (num === 38 || num === 48) {
    	                    // extend color (38=fg, 48=bg)
    	                    var is_foreground = num === 38;
    	                    if (nums.length >= 1) {
    	                        var mode = nums.shift();
    	                        if (mode === "5" && nums.length >= 1) {
    	                            // palette color
    	                            var palette_index = parseInt(nums.shift());
    	                            if (palette_index >= 0 && palette_index <= 255) {
    	                                if (!use_classes) {
    	                                    if (!this.PALETTE_COLORS) {
    	                                        self.setupPalette();
    	                                    }
    	                                    if (is_foreground) {
    	                                        self.fg = this.PALETTE_COLORS[palette_index];
    	                                    } else {
    	                                        self.bg = this.PALETTE_COLORS[palette_index];
    	                                    }
    	                                } else {
    	                                    var klass = palette_index >= 16 ? "ansi-palette-" + palette_index : ANSI_COLORS[palette_index > 7 ? 1 : 0][palette_index % 8]["class"];
    	                                    if (is_foreground) {
    	                                        self.fg = klass;
    	                                    } else {
    	                                        self.bg = klass;
    	                                    }
    	                                }
    	                            }
    	                        } else if (mode === "2" && nums.length >= 3) {
    	                            // true color
    	                            var r = parseInt(nums.shift());
    	                            var g = parseInt(nums.shift());
    	                            var b = parseInt(nums.shift());
    	                            if (r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255) {
    	                                var color = r + ", " + g + ", " + b;
    	                                if (!use_classes) {
    	                                    if (is_foreground) {
    	                                        self.fg = color;
    	                                    } else {
    	                                        self.bg = color;
    	                                    }
    	                                } else {
    	                                    if (is_foreground) {
    	                                        self.fg = "ansi-truecolor";
    	                                        self.fg_truecolor = color;
    	                                    } else {
    	                                        self.bg = "ansi-truecolor";
    	                                        self.bg_truecolor = color;
    	                                    }
    	                                }
    	                            }
    	                        }
    	                    }
    	                }
    	            }

    	            if (self.fg === null && self.bg === null && self.decoration === null) {
    	                return result;
    	            } else {

    	                result.fg = self.fg;
    	                result.bg = self.bg;
    	                result.fg_truecolor = self.fg_truecolor;
    	                result.bg_truecolor = self.bg_truecolor;
    	                result.decoration = self.decoration;
    	                result.was_processed = true;

    	                return result;
    	            }
    	        }

    	        /**
    	         * processChunk
    	         * Processes the current chunk of text.
    	         *
    	         * @name processChunk
    	         * @function
    	         * @param {String} text The input text.
    	         * @param {Object} options An object containing the following fields:
    	         *
    	         *  - `json` (Boolean): If `true`, the result will be an object.
    	         *  - `use_classes` (Boolean): If `true`, HTML classes will be appended to the HTML output.
    	         *
    	         * @param {Boolean} markup If false, the colors will not be parsed.
    	         * @return {Object|String} The result (object if `json` is wanted back or string otherwise).
    	         */

    	    }, {
    	        key: "processChunk",
    	        value: function processChunk(text, options, markup) {
    	            var _this2 = this;
    	            options = options || {};
    	            var jsonChunk = this.processChunkJson(text, options, markup);

    	            if (options.json) {
    	                return jsonChunk;
    	            }
    	            if (jsonChunk.isEmpty()) {
    	                return "";
    	            }
    	            if (!jsonChunk.was_processed) {
    	                return jsonChunk.content;
    	            }

    	            var use_classes = options.use_classes;

    	            var styles = [];
    	            var classes = [];
    	            var data = {};
    	            var render_data = function render_data(data) {
    	                var fragments = [];
    	                var key = void 0;
    	                for (key in data) {
    	                    if (data.hasOwnProperty(key)) {
    	                        fragments.push("data-" + key + "=\"" + _this2.escapeForHtml(data[key]) + "\"");
    	                    }
    	                }
    	                return fragments.length > 0 ? " " + fragments.join(" ") : "";
    	            };

    	            if (jsonChunk.fg) {
    	                if (use_classes) {
    	                    classes.push(jsonChunk.fg + "-fg");
    	                    if (jsonChunk.fg_truecolor !== null) {
    	                        data["ansi-truecolor-fg"] = jsonChunk.fg_truecolor;
    	                        jsonChunk.fg_truecolor = null;
    	                    }
    	                } else {
    	                    styles.push("color:rgb(" + jsonChunk.fg + ")");
    	                }
    	            }

    	            if (jsonChunk.bg) {
    	                if (use_classes) {
    	                    classes.push(jsonChunk.bg + "-bg");
    	                    if (jsonChunk.bg_truecolor !== null) {
    	                        data["ansi-truecolor-bg"] = jsonChunk.bg_truecolor;
    	                        jsonChunk.bg_truecolor = null;
    	                    }
    	                } else {
    	                    styles.push("background-color:rgb(" + jsonChunk.bg + ")");
    	                }
    	            }

    	            if (jsonChunk.decoration) {
    	                if (use_classes) {
    	                    classes.push("ansi-" + jsonChunk.decoration);
    	                } else if (jsonChunk.decoration === "bold") {
    	                    styles.push("font-weight:bold");
    	                } else if (jsonChunk.decoration === "dim") {
    	                    styles.push("opacity:0.5");
    	                } else if (jsonChunk.decoration === "italic") {
    	                    styles.push("font-style:italic");
    	                    // underline and blink are treated bellow
    	                } else if (jsonChunk.decoration === "reverse") {
    	                    styles.push("filter:invert(100%)");
    	                } else if (jsonChunk.decoration === "hidden") {
    	                    styles.push("visibility:hidden");
    	                } else if (jsonChunk.decoration === "strikethrough") {
    	                    styles.push("text-decoration:line-through");
    	                } else {
    	                    styles.push("text-decoration:" + jsonChunk.decoration);
    	                }
    	            }

    	            if (use_classes) {
    	                return "<span class=\"" + classes.join(" ") + "\"" + render_data(data) + ">" + jsonChunk.content + "</span>";
    	            } else {
    	                return "<span style=\"" + styles.join(";") + "\"" + render_data(data) + ">" + jsonChunk.content + "</span>";
    	            }
    	        }
    	    }]);

    	    return Anser;
    	}();

    	lib = Anser;
    	return lib;
    }

    var escapeCarriage = {exports: {}};

    /**
     * Escape carrigage returns like a terminal
     * @param {string} txt - String to escape.
     * @return {string}    - Escaped string.
     */

    var hasRequiredEscapeCarriage;

    function requireEscapeCarriage () {
    	if (hasRequiredEscapeCarriage) return escapeCarriage.exports;
    	hasRequiredEscapeCarriage = 1;
    	function escapeCarriageReturn(txt) {
    	  if (!txt) return "";
    	  if (!/\r/.test(txt)) return txt;
    	  txt = txt.replace(/\r+\n/gm, "\n"); // \r followed by \n --> newline
    	  while (/\r./.test(txt)) {
    	    txt = txt.replace(/^([^\r\n]*)\r+([^\r\n]+)/gm, function (_, base, insert) {
    	      return insert + base.slice(insert.length);
    	    });
    	  }
    	  return txt;
    	}

    	function findLongestString(arr) {
    	  var longest = 0;
    	  for (var i = 0; i < arr.length; i++) {
    	    if (arr[longest].length <= arr[i].length) {
    	      longest = i;
    	    }
    	  }
    	  return longest;
    	}

    	function escapeSingleLineSafe(txt) {
    	  if (!/\r/.test(txt)) return txt;
    	  var arr = txt.split("\r");
    	  var res = [];

    	  while (arr.length > 0) {
    	    var longest = findLongestString(arr);
    	    res.push(arr[longest]);
    	    arr = arr.slice(longest + 1);
    	  }

    	  return res.join("\r");
    	}

    	/**
    	 * Safely escape carrigage returns like a terminal.
    	 * This allows to escape carrigage returns while allowing future output to be appended
    	 * without loosing information.
    	 * Use this as a intermediate escape step if your stream hasn't completed yet.
    	 * @param {string} txt - String to escape.
    	 * @return {string}    - Escaped string.
    	 */
    	function escapeCarriageReturnSafe(txt) {
    	  if (!txt) return "";
    	  if (!/\r/.test(txt)) return txt;
    	  if (!/\n/.test(txt)) return escapeSingleLineSafe(txt);
    	  txt = txt.replace(/\r+\n/gm, "\n"); // \r followed by \n --> newline
    	  var idx = txt.lastIndexOf("\n");

    	  return (
    	    escapeCarriageReturn(txt.slice(0, idx)) +
    	    "\n" +
    	    escapeSingleLineSafe(txt.slice(idx + 1))
    	  );
    	}

    	escapeCarriage.exports = escapeCarriageReturn;
    	escapeCarriage.exports.escapeCarriageReturn = escapeCarriageReturn;
    	escapeCarriage.exports.escapeCarriageReturnSafe = escapeCarriageReturnSafe;
    	return escapeCarriage.exports;
    }

    var hasRequiredLib;

    function requireLib () {
    	if (hasRequiredLib) return lib$1;
    	hasRequiredLib = 1;
    	var __importDefault = (lib$1 && lib$1.__importDefault) || function (mod) {
    	    return (mod && mod.__esModule) ? mod : { "default": mod };
    	};
    	var __importStar = (lib$1 && lib$1.__importStar) || function (mod) {
    	    if (mod && mod.__esModule) return mod;
    	    var result = {};
    	    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    	    result["default"] = mod;
    	    return result;
    	};
    	Object.defineProperty(lib$1, "__esModule", { value: true });
    	const anser_1 = __importDefault(requireLib$1());
    	const escape_carriage_1 = requireEscapeCarriage();
    	const React$1 = __importStar(React);
    	/**
    	 * Converts ANSI strings into JSON output.
    	 * @name ansiToJSON
    	 * @function
    	 * @param {String} input The input string.
    	 * @param {boolean} use_classes If `true`, HTML classes will be appended
    	 *                              to the HTML output.
    	 * @return {Array} The parsed input.
    	 */
    	function ansiToJSON(input, use_classes = false) {
    	    input = escape_carriage_1.escapeCarriageReturn(fixBackspace(input));
    	    return anser_1.default.ansiToJson(input, {
    	        json: true,
    	        remove_empty: true,
    	        use_classes,
    	    });
    	}
    	/**
    	 * Create a class string.
    	 * @name createClass
    	 * @function
    	 * @param {AnserJsonEntry} bundle
    	 * @return {String} class name(s)
    	 */
    	function createClass(bundle) {
    	    let classNames = "";
    	    if (bundle.bg) {
    	        classNames += `${bundle.bg}-bg `;
    	    }
    	    if (bundle.fg) {
    	        classNames += `${bundle.fg}-fg `;
    	    }
    	    if (bundle.decoration) {
    	        classNames += `ansi-${bundle.decoration} `;
    	    }
    	    if (classNames === "") {
    	        return null;
    	    }
    	    classNames = classNames.substring(0, classNames.length - 1);
    	    return classNames;
    	}
    	/**
    	 * Create the style attribute.
    	 * @name createStyle
    	 * @function
    	 * @param {AnserJsonEntry} bundle
    	 * @return {Object} returns the style object
    	 */
    	function createStyle(bundle) {
    	    const style = {};
    	    if (bundle.bg) {
    	        style.backgroundColor = `rgb(${bundle.bg})`;
    	    }
    	    if (bundle.fg) {
    	        style.color = `rgb(${bundle.fg})`;
    	    }
    	    return style;
    	}
    	/**
    	 * Converts an Anser bundle into a React Node.
    	 * @param linkify whether links should be converting into clickable anchor tags.
    	 * @param useClasses should render the span with a class instead of style.
    	 * @param bundle Anser output.
    	 * @param key
    	 */
    	function convertBundleIntoReact(linkify, useClasses, bundle, key) {
    	    const style = useClasses ? null : createStyle(bundle);
    	    const className = useClasses ? createClass(bundle) : null;
    	    if (!linkify) {
    	        return React$1.createElement("span", { style, key, className }, bundle.content);
    	    }
    	    const content = [];
    	    const linkRegex = /(\s|^)(https?:\/\/(?:www\.|(?!www))[^\s.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/g;
    	    let index = 0;
    	    let match;
    	    while ((match = linkRegex.exec(bundle.content)) !== null) {
    	        const [, pre, url] = match;
    	        const startIndex = match.index + pre.length;
    	        if (startIndex > index) {
    	            content.push(bundle.content.substring(index, startIndex));
    	        }
    	        // Make sure the href we generate from the link is fully qualified. We assume http
    	        // if it starts with a www because many sites don't support https
    	        const href = url.startsWith("www.") ? `http://${url}` : url;
    	        content.push(React$1.createElement("a", {
    	            key: index,
    	            href,
    	            target: "_blank",
    	        }, `${url}`));
    	        index = linkRegex.lastIndex;
    	    }
    	    if (index < bundle.content.length) {
    	        content.push(bundle.content.substring(index));
    	    }
    	    return React$1.createElement("span", { style, key, className }, content);
    	}
    	function Ansi(props) {
    	    const { className, useClasses, children, linkify } = props;
    	    return React$1.createElement("code", { className }, ansiToJSON(children !== null && children !== void 0 ? children : "", useClasses !== null && useClasses !== void 0 ? useClasses : false).map(convertBundleIntoReact.bind(null, linkify !== null && linkify !== void 0 ? linkify : false, useClasses !== null && useClasses !== void 0 ? useClasses : false)));
    	}
    	lib$1.default = Ansi;
    	// This is copied from the Jupyter Classic source code
    	// notebook/static/base/js/utils.js to handle \b in a way
    	// that is **compatible with Jupyter classic**.   One can
    	// argue that this behavior is questionable:
    	//   https://stackoverflow.com/questions/55440152/multiple-b-doesnt-work-as-expected-in-jupyter#
    	function fixBackspace(txt) {
    	    let tmp = txt;
    	    do {
    	        txt = tmp;
    	        // Cancel out anything-but-newline followed by backspace
    	        tmp = txt.replace(/[^\n]\x08/gm, "");
    	    } while (tmp.length < txt.length);
    	    return txt;
    	}
    	return lib$1;
    }

    var libExports = requireLib();
    var Ansi = /*@__PURE__*/getDefaultExportFromCjs(libExports);

    var LogLevel;
    (function (LogLevel) {
        LogLevel[LogLevel["INFO"] = 0] = "INFO";
        LogLevel[LogLevel["WARNING"] = 1] = "WARNING";
        LogLevel[LogLevel["ERROR"] = 2] = "ERROR";
    })(LogLevel || (LogLevel = {}));
    class RenderLogViewer extends React.Component {
        constructor(props) {
            super(props);
            this.exportToClipBoard = () => {
                const { selectedLog, searchQuery, searchedLogs } = this.state;
                if (!selectedLog)
                    return;
                const logsToCopy = (searchQuery.length ? searchedLogs : selectedLog.logs)
                    .map((log) => atob(log.message))
                    .join('')
                    /** Strip all ANSI colors that were provided by Millennium */
                    .replace(/\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])/g, '');
                if (PySetClipboardText({ data: logsToCopy })) {
                    this.setState({ copyIcon: jsxRuntime.jsx(client.IconsModule.Checkmark, {}) });
                    setTimeout(() => {
                        this.setState({ copyIcon: jsxRuntime.jsx(client.IconsModule.Copy, {}) });
                    }, 2000);
                }
            };
            this.filterLogsBySearchQuery = (e) => {
                if (!this.state.selectedLog)
                    return;
                const searchQuery = e.target.value;
                const matchedLogs = this.state.selectedLog.logs.filter((log) => atob(log.message).toLowerCase().includes(searchQuery.toLowerCase()));
                this.setState({ searchQuery, searchedLogs: matchedLogs });
            };
            this.renderLogItemButton = (log) => {
                const errors = log.logs.filter((log) => log.level === LogLevel.ERROR);
                const warnings = log.logs.filter((log) => log.level === LogLevel.WARNING);
                const messageType = errors.length !== 0 ? 'encountered errors' : 'issued warnings';
                return (jsxRuntime.jsxs(client.DialogButton, { onClick: () => this.setState({ selectedLog: log, searchedLogs: log.logs }), className: client.joinClassNames('MillenniumButton', 'MillenniumLogs_LogItemButton', settingsClasses.SettingsDialogButton), "data-error-count": errors.length, "data-warning-count": warnings.length, children: [jsxRuntime.jsx(DesktopTooltip, { bDisabled: errors.length === 0 && warnings.length === 0, toolTipContent: `${log.name} ${messageType}.`, direction: "top", children: jsxRuntime.jsx(client.IconsModule.ExclamationPoint, {}) }), log?.name] }, log.name));
            };
            this.state = {
                logData: undefined,
                selectedLog: undefined,
                searchedLogs: [],
                searchQuery: '',
                errorCount: 0,
                warningCount: 0,
                copyIcon: jsxRuntime.jsx(client.IconsModule.Copy, {}),
                logFontSize: 16,
            };
        }
        componentDidMount() {
            PyGetLogData().then((data) => {
                const parsed = JSON.parse(data);
                this.setState({ logData: parsed });
            });
        }
        componentDidUpdate(_prevProps, prevState) {
            /** Kinda a hacky way to change the title, but its good enough and doesn't interfere with anything */
            if (this.state.selectedLog !== prevState.selectedLog) {
                const container = window.PLUGIN_LIST[pluginName].mainWindow.document.querySelector('.MillenniumSettings .DialogHeader');
                if (container) {
                    container.textContent = this.state.selectedLog?.name || locale.settingsPanelLogs;
                }
                this.aggregateLogStats();
            }
        }
        aggregateLogStats() {
            if (!this.state.selectedLog)
                return;
            const errorCount = this.state.selectedLog.logs.filter((log) => log.level === LogLevel.ERROR).length;
            const warningCount = this.state.selectedLog.logs.filter((log) => log.level === LogLevel.WARNING).length;
            this.setState({ errorCount, warningCount });
        }
        renderSelector() {
            const { logData } = this.state;
            if (!logData)
                return null;
            /** Millennium specific logs */
            const millenniumNames = new Set(['Digitaldepot', 'Standard Output', 'Package Manager']);
            const { millenniumItems, userPlugins } = logData.reduce((acc, item) => {
                (millenniumNames.has(item.name) ? acc.millenniumItems : acc.userPlugins).push(item);
                return acc;
            }, { millenniumItems: [], userPlugins: [] });
            let components = [];
            if (millenniumItems.length) {
                components.push(jsxRuntime.jsxs(client.DialogControlsSection, { children: [jsxRuntime.jsx(SettingsDialogSubHeader, { children: "Digitaldepot Logs" }), jsxRuntime.jsx("div", { className: "MillenniumButtonsSection MillenniumLogsSection", children: millenniumItems.map((log) => this.renderLogItemButton(log)) })] }));
            }
            if (userPlugins.length) {
                components.push(jsxRuntime.jsxs(client.DialogControlsSection, { children: [jsxRuntime.jsx(SettingsDialogSubHeader, { children: "User Plugins" }), jsxRuntime.jsx("div", { className: "MillenniumButtonsSection MillenniumLogsSection", children: userPlugins.map((log) => this.renderLogItemButton(log)) })] }));
            }
            return components;
        }
        renderViewer() {
            const { selectedLog, searchedLogs, searchQuery, errorCount, warningCount, copyIcon, logFontSize } = this.state;
            return (jsxRuntime.jsxs("div", { className: "MillenniumLogs_TextContainer", children: [jsxRuntime.jsxs("div", { className: "MillenniumLogs_ControlSection", children: [jsxRuntime.jsxs("div", { className: "MillenniumLogs_NavContainer", children: [jsxRuntime.jsxs(client.DialogButton, { onClick: () => this.setState({ selectedLog: null }), className: `MillenniumButton ${settingsClasses.SettingsDialogButton}`, children: [jsxRuntime.jsx(client.IconsModule.Carat, { direction: "left" }), "Back"] }), jsxRuntime.jsx(client.TextField, { placeholder: "Search...", onChange: this.filterLogsBySearchQuery })] }), jsxRuntime.jsxs("div", { className: "MillenniumLogs_TextControls", children: [jsxRuntime.jsxs("div", { className: "MillenniumLogs_HeaderTextTypeContainer", children: [jsxRuntime.jsxs("div", { className: "MillenniumLogs_HeaderTextTypeCount", "data-type": "error", "data-count": errorCount, children: [errorCount, " Errors"] }), jsxRuntime.jsxs("div", { className: "MillenniumLogs_HeaderTextTypeCount", "data-type": "warning", "data-count": warningCount, children: [warningCount, " Warnings"] })] }), jsxRuntime.jsxs("div", { className: "MillenniumLogs_Icons", children: [jsxRuntime.jsx(IconButton, { onClick: () => this.setState({ logFontSize: logFontSize - 1 }), children: jsxRuntime.jsx(client.IconsModule.Minus, {}) }), jsxRuntime.jsx(IconButton, { onClick: () => this.setState({ logFontSize: logFontSize + 1 }), children: jsxRuntime.jsx(client.IconsModule.Add, {}) }), jsxRuntime.jsx(IconButton, { onClick: this.exportToClipBoard, children: copyIcon })] })] })] }), jsxRuntime.jsx("pre", { className: "MillenniumLogs_Text DialogInput DialogTextInputBase", style: { fontSize: logFontSize + 'px' }, children: (searchQuery.length ? searchedLogs : selectedLog.logs).map((log, index) => (jsxRuntime.jsx(Ansi, { children: atob(log.message) }, index))) })] }));
        }
        render() {
            const { selectedLog } = this.state;
            return !selectedLog ? this.renderSelector() : this.renderViewer();
        }
    }

    var TooltipType;
    (function (TooltipType) {
        TooltipType["Error"] = "error";
        TooltipType["Warning"] = "warning";
        TooltipType["None"] = "none";
    })(TooltipType || (TooltipType = {}));
    class RenderPluginComponent extends React.Component {
        constructor() {
            super(...arguments);
            this.showCtxMenu = (e) => {
                const { plugin } = this.props;
                client.showContextMenu(jsxRuntime.jsxs(client.Menu, { label: "MillenniumPluginContextMenu", children: [jsxRuntime.jsx(client.MenuItem, { onSelected: () => { }, bInteractableItem: false, tone: "emphasis", disabled: true, children: plugin.data.common_name }), jsxRuntime.jsx(Separator, {}), jsxRuntime.jsx(client.MenuItem, { onSelected: () => { }, children: "Reload" }), jsxRuntime.jsx(client.MenuItem, { onSelected: this.uninstallPlugin.bind(this), children: "Uninstall" }), jsxRuntime.jsx(client.MenuItem, { onSelected: Utils.BrowseLocalFolder.bind(null, plugin.path), children: "Browse local files" })] }), e.currentTarget ?? window);
            };
        }
        async uninstallPlugin() {
            const { plugin, refetchPlugins } = this.props;
            const shouldUninstall = await Utils.ShowMessageBox(`Are you sure you want to uninstall ${plugin.data.common_name}?`, 'Heads up!');
            if (!shouldUninstall)
                return;
            const success = await PyUninstallPlugin({ pluginName: plugin.data.name });
            if (success == false) {
                Utils.ShowMessageBox(`Failed to uninstall ${plugin.data.common_name}. Check the logs tab for more details.`, 'Whoops', {
                    bAlertDialog: true,
                });
            }
            await refetchPlugins();
        }
        getTooltipContent() {
            const { plugin, hasErrors, hasWarnings } = this.props;
            const statusMap = [
                { condition: hasErrors, color: 'red', message: 'encountered errors', type: TooltipType.Error },
                { condition: hasWarnings, color: '#ffc82c', message: 'issued warnings', type: TooltipType.Warning },
            ];
            const status = statusMap.find((entry) => entry.condition);
            if (!status)
                return { type: TooltipType.None, content: null };
            return {
                type: status.type,
                content: (jsxRuntime.jsx(DesktopTooltip, { toolTipContent: `${plugin?.data?.common_name} ${status.message}. Please check the logs tab for more details.`, direction: "top", children: jsxRuntime.jsx(client.IconsModule.ExclamationPoint, { color: status.color }) })),
            };
        }
        render() {
            const { plugin, index, isLastPlugin, isEnabled, onSelectionChange } = this.props;
            /** Don't render the Millennium plugin */
            if (plugin.data.name === 'core')
                return null;
            const { type, content } = this.getTooltipContent();
            return (jsxRuntime.jsxs(client.Field, { label: jsxRuntime.jsxs("div", { className: "MillenniumPlugins_PluginLabel", children: [plugin.data.common_name, plugin.data.version && jsxRuntime.jsx("div", { className: "MillenniumItem_Version", children: plugin.data.version })] }), icon: content, padding: "standard", bottomSeparator: isLastPlugin ? 'none' : 'standard', className: "MillenniumPlugins_PluginField", "data-plugin-name": plugin.data.name, "data-plugin-version": plugin.data.version, "data-plugin-common-name": plugin.data.common_name, "data-plugin-status": type, children: [jsxRuntime.jsx(client.Toggle, { disabled: plugin.data.name === 'core', value: isEnabled, onChange: onSelectionChange.bind(null, index) }, plugin.data.name), jsxRuntime.jsx(IconButton, { onClick: this.showCtxMenu, children: jsxRuntime.jsx(FaEllipsisH, {}) })] }, index));
        }
    }

    class PluginViewModal extends React.Component {
        constructor() {
            super(...arguments);
            this.state = {
                plugins: undefined,
                checkedItems: {},
                pluginsWithLogs: undefined,
                updatedPlugins: [],
            };
        }
        componentDidMount() {
            this.FetchAllPlugins();
        }
        getEnabledPlugins(plugins) {
            return plugins
                .map((plugin, index) => ({ plugin, index }))
                .filter(({ plugin }) => plugin.enabled)
                .reduce((acc, { index }) => ({ ...acc, [index]: true }), {});
        }
        async FetchAllPlugins() {
            const plugins = JSON.parse(await PyFindAllPlugins());
            const checkedItems = this.getEnabledPlugins(plugins);
            const pluginNames = plugins.map((p) => p.data.common_name);
            const pluginsWithLogs = new Map();
            const result = await PyGetLogData();
            const logData = JSON.parse(result);
            for (let plugin of logData) {
                if (pluginNames.includes(plugin.name)) {
                    const errors = plugin.logs.filter((l) => l.level === LogLevel.ERROR).length;
                    const warnings = plugin.logs.filter((l) => l.level === LogLevel.WARNING).length;
                    pluginsWithLogs.set(plugin.name, { errors, warnings });
                }
            }
            this.setState({ plugins, checkedItems, pluginsWithLogs });
        }
        handleCheckboxChange(index) {
            const plugin = this.state.plugins[index];
            const originalChecked = plugin.enabled;
            const updated = !this.state.checkedItems[index] || plugin.data.name === 'core';
            const checkedItems = { ...this.state.checkedItems, [index]: updated };
            const filtered = this.state.updatedPlugins.filter((p) => p.plugin_name !== plugin.data.name);
            const updatedPlugins = updated !== originalChecked ? [...filtered, { plugin_name: plugin.data.name, enabled: updated }] : filtered;
            this.setState({ checkedItems, updatedPlugins });
        }
        SavePluginChanges() {
            const onOK = () => {
                PyUpdatePluginStatus({ pluginJson: JSON.stringify(this.state.updatedPlugins) });
            };
            client.showModal(jsxRuntime.jsx(client.ConfirmModal, { strTitle: locale.optionReloadRequired, strDescription: locale.optionPluginNeedsReload, strOKButtonText: locale.optionReloadNow, onOK: onOK }), window.PLUGIN_LIST[pluginName].mainWindow, { bNeverPopOut: false });
        }
        async OpenPluginsFolder() {
            const path = await PyGetEnvironmentVar({ variable: 'Digitaldepot__PLUGINS_PATH' });
            Utils.BrowseLocalFolder(path);
        }
        async InstallPluginMenu() {
            await showInstallPluginModal(this.FetchAllPlugins.bind(this));
        }
        renderPluginComponent({ plugin, index }) {
            const logState = this.state.pluginsWithLogs?.get(plugin.data.common_name);
            return (jsxRuntime.jsx(RenderPluginComponent, { plugin: plugin, index: index, isLastPlugin: index === this.state.plugins.length - 1, isEnabled: this.state.checkedItems[index], hasErrors: logState?.errors > 0, hasWarnings: logState?.warnings > 0, onSelectionChange: (index) => this.handleCheckboxChange(index), refetchPlugins: this.FetchAllPlugins.bind(this) }));
        }
        render() {
            if (window.PLUGIN_LIST[pluginName].connectionFailed) {
                return (jsxRuntime.jsx(Placeholder, { icon: jsxRuntime.jsx(client.IconsModule.ExclamationPoint, {}), header: locale.errorFailedConnection, body: locale.errorFailedConnectionBody, children: jsxRuntime.jsx(client.DialogButton, { className: settingsClasses.SettingsDialogButton, onClick: () => {
                            Utils.BrowseLocalFolder([window.PLUGIN_LIST[pluginName].steamPath, 'ext', 'data', 'logs'].join('/'));
                        }, children: locale.errorFailedConnectionButton }) }));
            }
            /** Haven't received the plugins yet from the backend */
            if (this.state.plugins === undefined) {
                return null;
            }
            if (!this.state.plugins || !this.state.plugins.length || (this.state.plugins.length === 1 && this.state.plugins[0].data.name === 'core')) {
                return (jsxRuntime.jsxs(Placeholder, { icon: jsxRuntime.jsx(PiPlugsFill, { className: "SVGIcon_Button" }), header: 'No Plugins Found.', body: "It appears you don't have any plugin yet!", children: [jsxRuntime.jsxs(client.DialogButton, { className: client.joinClassNames(settingsClasses.SettingsDialogButton, 'MillenniumPlaceholder_Button'), onClick: this.InstallPluginMenu.bind(this), children: [jsxRuntime.jsx(FaStore, {}), locale.optionInstallPlugin] }), jsxRuntime.jsxs(client.DialogButton, { className: client.joinClassNames(settingsClasses.SettingsDialogButton, 'MillenniumPlaceholder_Button'), onClick: this.OpenPluginsFolder.bind(this), children: [jsxRuntime.jsx(FaFolderOpen, {}), locale.optionBrowseLocalFiles] })] }));
            }
            return (jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [jsxRuntime.jsxs(client.DialogControlsSection, { className: "MillenniumButtonsSection", children: [jsxRuntime.jsxs(client.DialogButton, { className: `MillenniumButton ${settingsClasses.SettingsDialogButton}`, onClick: this.SavePluginChanges.bind(this), disabled: !this.state.updatedPlugins.length, "data-button-type": 'save', children: [jsxRuntime.jsx(FaSave, {}), locale.optionSaveChanges] }), jsxRuntime.jsxs(client.DialogButton, { className: `MillenniumButton ${settingsClasses.SettingsDialogButton}`, onClick: this.InstallPluginMenu.bind(this), "data-button-type": 'install-plugin', children: [jsxRuntime.jsx(FaStore, {}), locale.optionInstallPlugin] }), jsxRuntime.jsxs(client.DialogButton, { className: `MillenniumButton ${settingsClasses.SettingsDialogButton}`, onClick: this.OpenPluginsFolder.bind(this), "data-button-type": 'browse-plugin-local-files', children: [jsxRuntime.jsx(FaFolderOpen, {}), locale.optionBrowseLocalFiles] })] }), this.state.plugins.map((plugin, index) => this.renderPluginComponent({ plugin, index }))] }));
        }
    }

    function t(){return t=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r]);}return e},t.apply(this,arguments)}const n=["children","options"],r={blockQuote:"0",breakLine:"1",breakThematic:"2",codeBlock:"3",codeFenced:"4",codeInline:"5",footnote:"6",footnoteReference:"7",gfmTask:"8",heading:"9",headingSetext:"10",htmlBlock:"11",htmlComment:"12",htmlSelfClosing:"13",image:"14",link:"15",linkAngleBraceStyleDetector:"16",linkBareUrlDetector:"17",linkMailtoDetector:"18",newlineCoalescer:"19",orderedList:"20",paragraph:"21",ref:"22",refImage:"23",refLink:"24",table:"25",text:"27",textBolded:"28",textEmphasized:"29",textEscaped:"30",textMarked:"31",textStrikethroughed:"32",unorderedList:"33"};var i;!function(e){e[e.MAX=0]="MAX",e[e.HIGH=1]="HIGH",e[e.MED=2]="MED",e[e.LOW=3]="LOW",e[e.MIN=4]="MIN";}(i||(i={}));const l=["allowFullScreen","allowTransparency","autoComplete","autoFocus","autoPlay","cellPadding","cellSpacing","charSet","classId","colSpan","contentEditable","contextMenu","crossOrigin","encType","formAction","formEncType","formMethod","formNoValidate","formTarget","frameBorder","hrefLang","inputMode","keyParams","keyType","marginHeight","marginWidth","maxLength","mediaGroup","minLength","noValidate","radioGroup","readOnly","rowSpan","spellCheck","srcDoc","srcLang","srcSet","tabIndex","useMap"].reduce((e,t)=>(e[t.toLowerCase()]=t,e),{class:"className",for:"htmlFor"}),o={amp:"&",apos:"'",gt:">",lt:"<",nbsp:" ",quot:"“"},a=["style","script"],c=["src","href","data","formAction","srcDoc","action"],s=/([-A-Z0-9_:]+)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|(?:\{((?:\\.|{[^}]*?}|[^}])*)\})))?/gi,d=/mailto:/i,u=/\n{2,}$/,p=/^(\s*>[\s\S]*?)(?=\n\n|$)/,f=/^ *> ?/gm,h=/^(?:\[!([^\]]*)\]\n)?([\s\S]*)/,m=/^ {2,}\n/,g=/^(?:( *[-*_])){3,} *(?:\n *)+\n/,y=/^(?: {1,3})?(`{3,}|~{3,}) *(\S+)? *([^\n]*?)?\n([\s\S]*?)(?:\1\n?|$)/,k=/^(?: {4}[^\n]+\n*)+(?:\n *)+\n?/,x=/^(`+)((?:\\`|(?!\1)`|[^`])+)\1/,b=/^(?:\n *)*\n/,v=/\r\n?/g,C=/^\[\^([^\]]+)](:(.*)((\n+ {4,}.*)|(\n(?!\[\^).+))*)/,$=/^\[\^([^\]]+)]/,S=/\f/g,w=/^---[ \t]*\n(.|\n)*\n---[ \t]*\n/,E=/^\s*?\[(x|\s)\]/,z=/^ *(#{1,6}) *([^\n]+?)(?: +#*)?(?:\n *)*(?:\n|$)/,L=/^ *(#{1,6}) +([^\n]+?)(?: +#*)?(?:\n *)*(?:\n|$)/,A=/^([^\n]+)\n *(=|-){3,} *(?:\n *)+\n/,O=/^ *(?!<[a-z][^ >/]* ?\/>)<([a-z][^ >/]*) ?((?:[^>]*[^/])?)>\n?(\s*(?:<\1[^>]*?>[\s\S]*?<\/\1>|(?!<\1\b)[\s\S])*?)<\/\1>(?!<\/\1>)\n*/i,T=/&([a-z0-9]+|#[0-9]{1,6}|#x[0-9a-fA-F]{1,6});/gi,B=/^<!--[\s\S]*?(?:-->)/,M=/^(data|aria|x)-[a-z_][a-z\d_.-]*$/,R=/^ *<([a-z][a-z0-9:]*)(?:\s+((?:<.*?>|[^>])*))?\/?>(?!<\/\1>)(\s*\n)?/i,I=/^\{.*\}$/,D=/^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/,U=/^<([^ >]+@[^ >]+)>/,N=/^<([^ >]+:\/[^ >]+)>/,j=/-([a-z])?/gi,H=/^(\|.*)\n(?: *(\|? *[-:]+ *\|[-| :]*)\n((?:.*\|.*\n)*))?\n?/,P=/^\[([^\]]*)\]:\s+<?([^\s>]+)>?\s*("([^"]*)")?/,_=/^!\[([^\]]*)\] ?\[([^\]]*)\]/,F=/^\[([^\]]*)\] ?\[([^\]]*)\]/,W=/(\n|^[-*]\s|^#|^ {2,}|^-{2,}|^>\s)/,G=/\t/g,Z=/(^ *\||\| *$)/g,q=/^ *:-+: *$/,Q=/^ *:-+ *$/,V=/^ *-+: *$/,X="((?:\\[.*?\\][([].*?[)\\]]|<.*?>(?:.*?<.*?>)?|`.*?`|\\\\\\1|[\\s\\S])+?)",J=new RegExp(`^([*_])\\1${X}\\1\\1(?!\\1)`),K=new RegExp(`^([*_])${X}\\1(?!\\1)`),Y=new RegExp(`^(==)${X}\\1`),ee=new RegExp(`^(~~)${X}\\1`),te=/^\\([^0-9A-Za-z\s])/,ne=/\\([^0-9A-Za-z\s])/g,re=/^([\s\S](?:(?!  |[0-9]\.)[^=*_~\-\n<`\\\[!])*)/,ie=/^\n+/,le=/^([ \t]*)/,oe=/\\([^\\])/g,ae=/(?:^|\n)( *)$/,ce="(?:\\d+\\.)",se="(?:[*+-])";function de(e){return "( *)("+(1===e?ce:se)+") +"}const ue=de(1),pe=de(2);function fe(e){return new RegExp("^"+(1===e?ue:pe))}const he=fe(1),me=fe(2);function ge(e){return new RegExp("^"+(1===e?ue:pe)+"[^\\n]*(?:\\n(?!\\1"+(1===e?ce:se)+" )[^\\n]*)*(\\n|$)","gm")}const ye=ge(1),ke=ge(2);function xe(e){const t=1===e?ce:se;return new RegExp("^( *)("+t+") [\\s\\S]+?(?:\\n{2,}(?! )(?!\\1"+t+" (?!"+t+" ))\\n*|\\s*\\n*$)")}const be=xe(1),ve=xe(2);function Ce(e,t){const n=1===t,i=n?be:ve,l=n?ye:ke,o=n?he:me;return {match:Me(function(e,t){const n=ae.exec(t.prevCapture);return n&&(t.list||!t.inline&&!t.simple)?i.exec(e=n[1]+e):null}),order:1,parse(e,t,r){const i=n?+e[2]:void 0,a=e[0].replace(u,"\n").match(l);let c=false;return {items:a.map(function(e,n){const i=o.exec(e)[0].length,l=new RegExp("^ {1,"+i+"}","gm"),s=e.replace(l,"").replace(o,""),d=n===a.length-1,u=-1!==s.indexOf("\n\n")||d&&c;c=u;const p=r.inline,f=r.list;let h;r.list=true,u?(r.inline=false,h=ze(s)+"\n\n"):(r.inline=true,h=ze(s));const m=t(h,r);return r.inline=p,r.list=f,m}),ordered:n,start:i}},render:(t,n,i)=>e(t.ordered?"ol":"ul",{key:i.key,start:t.type===r.orderedList?t.start:void 0},t.items.map(function(t,r){return e("li",{key:r},n(t,i))}))}}const $e=new RegExp("^\\[((?:\\[[^\\]]*\\]|[^\\[\\]]|\\](?=[^\\[]*\\]))*)\\]\\(\\s*<?((?:\\([^)]*\\)|[^\\s\\\\]|\\\\.)*?)>?(?:\\s+['\"]([\\s\\S]*?)['\"])?\\s*\\)"),Se=/^!\[(.*?)\]\( *((?:\([^)]*\)|[^() ])*) *"?([^)"]*)?"?\)/,we=[p,y,k,z,A,L,H,be,ve],Ee=[...we,/^[^\n]+(?:  \n|\n{2,})/,O,B,R];function ze(e){let t=e.length;for(;t>0&&e[t-1]<=" ";)t--;return e.slice(0,t)}function Le(e){return e.replace(/[ÀÁÂÃÄÅàáâãäåæÆ]/g,"a").replace(/[çÇ]/g,"c").replace(/[ðÐ]/g,"d").replace(/[ÈÉÊËéèêë]/g,"e").replace(/[ÏïÎîÍíÌì]/g,"i").replace(/[Ññ]/g,"n").replace(/[øØœŒÕõÔôÓóÒò]/g,"o").replace(/[ÜüÛûÚúÙù]/g,"u").replace(/[ŸÿÝý]/g,"y").replace(/[^a-z0-9- ]/gi,"").replace(/ /gi,"-").toLowerCase()}function Ae(e){return V.test(e)?"right":q.test(e)?"center":Q.test(e)?"left":null}function Oe(e,t,n,r){const i=n.inTable;n.inTable=true;let l=[[]],o="";function a(){if(!o)return;const e=l[l.length-1];e.push.apply(e,t(o,n)),o="";}return e.trim().split(/(`[^`]*`|\\\||\|)/).filter(Boolean).forEach((e,t,n)=>{"|"===e.trim()&&(a(),r)?0!==t&&t!==n.length-1&&l.push([]):o+=e;}),a(),n.inTable=i,l}function Te(e,t,n){n.inline=true;const i=e[2]?e[2].replace(Z,"").split("|").map(Ae):[],l=e[3]?function(e,t,n){return e.trim().split("\n").map(function(e){return Oe(e,t,n,true)})}(e[3],t,n):[],o=Oe(e[1],t,n,!!l.length);return n.inline=false,l.length?{align:i,cells:l,header:o,type:r.table}:{children:o,type:r.paragraph}}function Be(e,t){return null==e.align[t]?{}:{textAlign:e.align[t]}}function Me(e){return e.inline=1,e}function Re(e){return Me(function(t,n){return n.inline?e.exec(t):null})}function Ie(e){return Me(function(t,n){return n.inline||n.simple?e.exec(t):null})}function De(e){return function(t,n){return n.inline||n.simple?null:e.exec(t)}}function Ue(e){return Me(function(t){return e.exec(t)})}function Ne(e,t){if(t.inline||t.simple)return null;let n="";e.split("\n").every(e=>(e+="\n",!we.some(t=>t.test(e))&&(n+=e,!!e.trim())));const r=ze(n);return ""==r?null:[n,,r]}const je=/(javascript|vbscript|data(?!:image)):/i;function He(e){try{const t=decodeURIComponent(e).replace(/[^A-Za-z0-9/:]/g,"");if(je.test(t))return null}catch(e){return null}return e}function Pe(e){return e.replace(oe,"$1")}function _e(e,t,n){const r=n.inline||false,i=n.simple||false;n.inline=true,n.simple=true;const l=e(t,n);return n.inline=r,n.simple=i,l}function Fe(e,t,n){const r=n.inline||false,i=n.simple||false;n.inline=false,n.simple=true;const l=e(t,n);return n.inline=r,n.simple=i,l}function We(e,t,n){const r=n.inline||false;n.inline=false;const i=e(t,n);return n.inline=r,i}const Ge=(e,t,n)=>({children:_e(t,e[2],n)});function Ze(){return {}}function qe(){return null}function Qe(...e){return e.filter(Boolean).join(" ")}function Ve(e,t,n){let r=e;const i=t.split(".");for(;i.length&&(r=r[i[0]],void 0!==r);)i.shift();return r||n}function Xe(n="",i={}){function u(e,n,...r){const l=Ve(i.overrides,`${e}.props`,{});return i.createElement(function(e,t){const n=Ve(t,e);return n?"function"==typeof n||"object"==typeof n&&"render"in n?n:Ve(t,`${e}.component`,e):e}(e,i.overrides),t({},n,l,{className:Qe(null==n?void 0:n.className,l.className)||void 0}),...r)}function Z(e){e=e.replace(w,"");let t=false;i.forceInline?t=true:i.forceBlock||(t=false===W.test(e));const n=ae(oe(t?e:`${ze(e).replace(ie,"")}\n\n`,{inline:t}));for(;"string"==typeof n[n.length-1]&&!n[n.length-1].trim();)n.pop();if(null===i.wrapper)return n;const r=i.wrapper||(t?"span":"div");let l;if(n.length>1||i.forceWrapper)l=n;else {if(1===n.length)return l=n[0],"string"==typeof l?u("span",{key:"outer"},l):l;l=null;}return i.createElement(r,{key:"outer"},l)}function q(e,t){const n=t.match(s);return n?n.reduce(function(t,n){const r=n.indexOf("=");if(-1!==r){const o=function(e){return  -1!==e.indexOf("-")&&null===e.match(M)&&(e=e.replace(j,function(e,t){return t.toUpperCase()})),e}(n.slice(0,r)).trim(),a=function(e){const t=e[0];return ('"'===t||"'"===t)&&e.length>=2&&e[e.length-1]===t?e.slice(1,-1):e}(n.slice(r+1).trim()),s=l[o]||o;if("ref"===s)return t;const d=t[s]=function(e,t,n,r){return "style"===t?function(e){const t=[];let n="",r=false,i=false,l="";if(!e)return t;for(let o=0;o<e.length;o++){const a=e[o];if('"'!==a&&"'"!==a||r||(i?a===l&&(i=false,l=""):(i=true,l=a)),"("===a&&n.endsWith("url")?r=true:")"===a&&r&&(r=false),";"!==a||i||r)n+=a;else {const e=n.trim();if(e){const n=e.indexOf(":");if(n>0){const r=e.slice(0,n).trim(),i=e.slice(n+1).trim();t.push([r,i]);}}n="";}}const o=n.trim();if(o){const e=o.indexOf(":");if(e>0){const n=o.slice(0,e).trim(),r=o.slice(e+1).trim();t.push([n,r]);}}return t}(n).reduce(function(t,[n,i]){return t[n.replace(/(-[a-z])/g,e=>e[1].toUpperCase())]=r(i,e,n),t},{}):-1!==c.indexOf(t)?r(n,e,t):(n.match(I)&&(n=n.slice(1,n.length-1)),"true"===n||"false"!==n&&n)}(e,o,a,i.sanitizer);"string"==typeof d&&(O.test(d)||R.test(d))&&(t[s]=Z(d.trim()));}else "style"!==n&&(t[l[n]||n]=true);return t},{}):null}i.overrides=i.overrides||{},i.sanitizer=i.sanitizer||He,i.slugify=i.slugify||Le,i.namedCodesToUnicode=i.namedCodesToUnicode?t({},o,i.namedCodesToUnicode):o,i.createElement=i.createElement||React__namespace.createElement;const Q=[],V={},X={[r.blockQuote]:{match:De(p),order:1,parse(e,t,n){const[,r,i]=e[0].replace(f,"").match(h);return {alert:r,children:t(i,n)}},render(e,t,n){const l={key:n.key};return e.alert&&(l.className="markdown-alert-"+i.slugify(e.alert.toLowerCase(),Le),e.children.unshift({attrs:{},children:[{type:r.text,text:e.alert}],noInnerParse:true,type:r.htmlBlock,tag:"header"})),u("blockquote",l,t(e.children,n))}},[r.breakLine]:{match:Ue(m),order:1,parse:Ze,render:(e,t,n)=>u("br",{key:n.key})},[r.breakThematic]:{match:De(g),order:1,parse:Ze,render:(e,t,n)=>u("hr",{key:n.key})},[r.codeBlock]:{match:De(k),order:0,parse:e=>({lang:void 0,text:ze(e[0].replace(/^ {4}/gm,"")).replace(ne,"$1")}),render:(e,n,r)=>u("pre",{key:r.key},u("code",t({},e.attrs,{className:e.lang?`lang-${e.lang}`:""}),e.text))},[r.codeFenced]:{match:De(y),order:0,parse:e=>({attrs:q("code",e[3]||""),lang:e[2]||void 0,text:e[4],type:r.codeBlock})},[r.codeInline]:{match:Ie(x),order:3,parse:e=>({text:e[2].replace(ne,"$1")}),render:(e,t,n)=>u("code",{key:n.key},e.text)},[r.footnote]:{match:De(C),order:0,parse:e=>(Q.push({footnote:e[2],identifier:e[1]}),{}),render:qe},[r.footnoteReference]:{match:Re($),order:1,parse:e=>({target:`#${i.slugify(e[1],Le)}`,text:e[1]}),render:(e,t,n)=>u("a",{key:n.key,href:i.sanitizer(e.target,"a","href")},u("sup",{key:n.key},e.text))},[r.gfmTask]:{match:Re(E),order:1,parse:e=>({completed:"x"===e[1].toLowerCase()}),render:(e,t,n)=>u("input",{checked:e.completed,key:n.key,readOnly:true,type:"checkbox"})},[r.heading]:{match:De(i.enforceAtxHeadings?L:z),order:1,parse:(e,t,n)=>({children:_e(t,e[2],n),id:i.slugify(e[2],Le),level:e[1].length}),render:(e,t,n)=>u(`h${e.level}`,{id:e.id,key:n.key},t(e.children,n))},[r.headingSetext]:{match:De(A),order:0,parse:(e,t,n)=>({children:_e(t,e[1],n),level:"="===e[2]?1:2,type:r.heading})},[r.htmlBlock]:{match:Ue(O),order:1,parse(e,t,n){const[,r]=e[3].match(le),i=new RegExp(`^${r}`,"gm"),l=e[3].replace(i,""),o=(c=l,Ee.some(e=>e.test(c))?We:_e);var c;const s=e[1].toLowerCase(),d=-1!==a.indexOf(s),u=(d?s:e[1]).trim(),p={attrs:q(u,e[2]),noInnerParse:d,tag:u};return n.inAnchor=n.inAnchor||"a"===s,d?p.text=e[3]:p.children=o(t,l,n),n.inAnchor=false,p},render:(e,n,r)=>u(e.tag,t({key:r.key},e.attrs),e.text||(e.children?n(e.children,r):""))},[r.htmlSelfClosing]:{match:Ue(R),order:1,parse(e){const t=e[1].trim();return {attrs:q(t,e[2]||""),tag:t}},render:(e,n,r)=>u(e.tag,t({},e.attrs,{key:r.key}))},[r.htmlComment]:{match:Ue(B),order:1,parse:()=>({}),render:qe},[r.image]:{match:Ie(Se),order:1,parse:e=>({alt:e[1],target:Pe(e[2]),title:e[3]}),render:(e,t,n)=>u("img",{key:n.key,alt:e.alt||void 0,title:e.title||void 0,src:i.sanitizer(e.target,"img","src")})},[r.link]:{match:Re($e),order:3,parse:(e,t,n)=>({children:Fe(t,e[1],n),target:Pe(e[2]),title:e[3]}),render:(e,t,n)=>u("a",{key:n.key,href:i.sanitizer(e.target,"a","href"),title:e.title},t(e.children,n))},[r.linkAngleBraceStyleDetector]:{match:Re(N),order:0,parse:e=>({children:[{text:e[1],type:r.text}],target:e[1],type:r.link})},[r.linkBareUrlDetector]:{match:Me((e,t)=>t.inAnchor||i.disableAutoLink?null:Re(D)(e,t)),order:0,parse:e=>({children:[{text:e[1],type:r.text}],target:e[1],title:void 0,type:r.link})},[r.linkMailtoDetector]:{match:Re(U),order:0,parse(e){let t=e[1],n=e[1];return d.test(n)||(n="mailto:"+n),{children:[{text:t.replace("mailto:",""),type:r.text}],target:n,type:r.link}}},[r.orderedList]:Ce(u,1),[r.unorderedList]:Ce(u,2),[r.newlineCoalescer]:{match:De(b),order:3,parse:Ze,render:()=>"\n"},[r.paragraph]:{match:Me(Ne),order:3,parse:Ge,render:(e,t,n)=>u("p",{key:n.key},t(e.children,n))},[r.ref]:{match:Re(P),order:0,parse:e=>(V[e[1]]={target:e[2],title:e[4]},{}),render:qe},[r.refImage]:{match:Ie(_),order:0,parse:e=>({alt:e[1]||void 0,ref:e[2]}),render:(e,t,n)=>V[e.ref]?u("img",{key:n.key,alt:e.alt,src:i.sanitizer(V[e.ref].target,"img","src"),title:V[e.ref].title}):null},[r.refLink]:{match:Re(F),order:0,parse:(e,t,n)=>({children:t(e[1],n),fallbackChildren:e[0],ref:e[2]}),render:(e,t,n)=>V[e.ref]?u("a",{key:n.key,href:i.sanitizer(V[e.ref].target,"a","href"),title:V[e.ref].title},t(e.children,n)):u("span",{key:n.key},e.fallbackChildren)},[r.table]:{match:De(H),order:1,parse:Te,render(e,t,n){const r=e;return u("table",{key:n.key},u("thead",null,u("tr",null,r.header.map(function(e,i){return u("th",{key:i,style:Be(r,i)},t(e,n))}))),u("tbody",null,r.cells.map(function(e,i){return u("tr",{key:i},e.map(function(e,i){return u("td",{key:i,style:Be(r,i)},t(e,n))}))})))}},[r.text]:{match:Ue(re),order:4,parse:e=>({text:e[0].replace(T,(e,t)=>i.namedCodesToUnicode[t]?i.namedCodesToUnicode[t]:e)}),render:e=>e.text},[r.textBolded]:{match:Ie(J),order:2,parse:(e,t,n)=>({children:t(e[2],n)}),render:(e,t,n)=>u("strong",{key:n.key},t(e.children,n))},[r.textEmphasized]:{match:Ie(K),order:3,parse:(e,t,n)=>({children:t(e[2],n)}),render:(e,t,n)=>u("em",{key:n.key},t(e.children,n))},[r.textEscaped]:{match:Ie(te),order:1,parse:e=>({text:e[1],type:r.text})},[r.textMarked]:{match:Ie(Y),order:3,parse:Ge,render:(e,t,n)=>u("mark",{key:n.key},t(e.children,n))},[r.textStrikethroughed]:{match:Ie(ee),order:3,parse:Ge,render:(e,t,n)=>u("del",{key:n.key},t(e.children,n))}};true===i.disableParsingRawHTML&&(delete X[r.htmlBlock],delete X[r.htmlSelfClosing]);const oe=function(e){let t=Object.keys(e);function n(r,i){let l,o,a=[],c="",s="";for(i.prevCapture=i.prevCapture||"";r;){let d=0;for(;d<t.length;){if(c=t[d],l=e[c],i.inline&&!l.match.inline){d++;continue}const u=l.match(r,i);if(u){s=u[0],i.prevCapture+=s,r=r.substring(s.length),o=l.parse(u,n,i),null==o.type&&(o.type=c),a.push(o);break}d++;}}return i.prevCapture="",a}return t.sort(function(t,n){let r=e[t].order,i=e[n].order;return r!==i?r-i:t<n?-1:1}),function(e,t){return n(function(e){return e.replace(v,"\n").replace(S,"").replace(G,"    ")}(e),t)}}(X),ae=(ce=function(e,t){return function(n,r,i){const l=e[n.type].render;return t?t(()=>l(n,r,i),n,r,i):l(n,r,i)}}(X,i.renderRule),function e(t,n={}){if(Array.isArray(t)){const r=n.key,i=[];let l=false;for(let r=0;r<t.length;r++){n.key=r;const o=e(t[r],n),a="string"==typeof o;a&&l?i[i.length-1]+=o:null!==o&&i.push(o),l=a;}return n.key=r,i}return ce(t,e,n)});var ce;const se=Z(n);return Q.length?u("div",null,se,u("footer",{key:"footer"},Q.map(function(e){return u("div",{id:i.slugify(e.identifier,Le),key:e.identifier},e.identifier,ae(oe(e.footnote,{inline:true})))}))):se}var Markdown = t=>{let{children:r="",options:i}=t,l=function(e,t){if(null==e)return {};var n,r,i={},l=Object.keys(e);for(r=0;r<l.length;r++)t.indexOf(n=l[r])>=0||(i[n]=e[n]);return i}(t,n);return React__namespace.cloneElement(Xe(r,i),l)};

    class UpdateCard extends React.Component {
        constructor(props) {
            super(props);
            this.descriptionHeight = 0;
            this.state = {
                showingMore: false,
            };
            this.descriptionRef = React.createRef();
            this.handleToggle = this.handleToggle.bind(this);
            this.makeAnchorExternalLink = this.makeAnchorExternalLink.bind(this);
        }
        componentDidMount() {
            this.measureDescriptionHeight();
        }
        componentDidUpdate(prevProps, prevState) {
            // Re-measure if content or visibility changes
            if (prevProps.update?.message !== this.props.update?.message || prevState.showingMore !== this.state.showingMore) {
                this.measureDescriptionHeight();
            }
        }
        measureDescriptionHeight() {
            if (this.descriptionRef.current) {
                this.descriptionHeight = this.descriptionRef.current.offsetHeight;
                this.forceUpdate(); // Needed to re-render with the measured height
            }
        }
        handleToggle() {
            this.setState((prevState) => ({ showingMore: !prevState.showingMore }));
        }
        showInteractables() {
            const { isUpdating, statusText, progress, onUpdateClick, update, toolTipText } = this.props;
            if (isUpdating) {
                return (jsxRuntime.jsx(client.ProgressBarWithInfo
                // @ts-ignore
                , { 
                    // @ts-ignore
                    className: "MillenniumUpdates_ProgressBar", sOperationText: statusText, nProgress: progress, nTransitionSec: 1000 }));
            }
            return (jsxRuntime.jsx(DesktopTooltip, { toolTipContent: `Update ${toolTipText || update.name}`, direction: "left", children: jsxRuntime.jsx(IconButton, { onClick: onUpdateClick, children: jsxRuntime.jsx(client.IconsModule.Download, {}, "download-icon") }) }));
        }
        makeAnchorExternalLink({ children, ...props }) {
            return (jsxRuntime.jsx("a", { target: "_blank", rel: "noopener noreferrer", ...props, children: children }));
        }
        renderDescription() {
            const { update } = this.props;
            return (jsxRuntime.jsx("div", { className: "MillenniumUpdates_Description", style: { height: this.descriptionHeight }, children: jsxRuntime.jsxs("div", { ref: this.descriptionRef, children: [jsxRuntime.jsxs("div", { children: [jsxRuntime.jsx("b", { children: locale.updatePanelReleasedTag }), " ", update?.date] }), jsxRuntime.jsxs("div", { children: [jsxRuntime.jsx("b", { children: locale.updatePanelReleasePatchNotes }), "\u00A0", jsxRuntime.jsx(Markdown, { options: { overrides: { a: { component: this.makeAnchorExternalLink } } }, children: update?.message })] })] }) }));
        }
        render() {
            const { showingMore } = this.state;
            const { update, index, totalCount } = this.props;
            return (jsxRuntime.jsxs(client.Field, { className: "MillenniumUpdates_Field", label: update.name, bottomSeparator: index === totalCount - 1 ? 'none' : 'standard', description: this.renderDescription(), "data-expanded": showingMore, children: [this.showInteractables(), jsxRuntime.jsx(IconButton, { onClick: this.handleToggle, className: "MillenniumUpdates_ExpandButton", children: jsxRuntime.jsx(client.IconsModule.Carat, { direction: "up" }) })] }, index));
        }
    }

    async function updateMillennium() {
        const downloadUrl = window.PLUGIN_LIST[pluginName].MillenniumUpdates?.platformRelease?.browser_download_url;
        if (!downloadUrl) {
            client.toaster.toast({
                title: `Millennium Update Error`,
                body: `No download URL found for update.`,
                logo: jsxRuntime.jsx(client.IconsModule.ExclamationPoint, { className: deferredSettingLabelClasses.Icon }),
                duration: 5000,
                critical: true,
                sound: 3,
            });
        }
        await PyUpdateMillennium({ downloadUrl });
        window.PLUGIN_LIST[pluginName].MillenniumUpdates.updateInProgress = true;
    }

    const MillenniumUpdateCard = ({ millenniumUpdates }) => {
        if (!millenniumUpdates || !millenniumUpdates?.hasUpdate)
            return null;
        const [isUpdateInProgress, setIsUpdateInProgress] = React.useState(window.PLUGIN_LIST[pluginName]?.millenniumUpdates?.updateInProgress || false);
        const startUpdateWindows = () => {
            setIsUpdateInProgress(true);
            client.showModal(jsxRuntime.jsx(client.ConfirmModal, { strTitle: locale.millenniumUpdateSuccessTitle, strDescription: formatString(locale.millenniumUpdateSuccessMessage, millenniumUpdates?.newVersion?.tag_name), bAlertDialog: true }), window.PLUGIN_LIST[pluginName].mainWindow, { bNeverPopOut: false });
        };
        const startUpdateLinux = () => {
            client.showModal(jsxRuntime.jsx(client.ConfirmModal, { strTitle: 'Update Millennium', strDescription: jsxRuntime.jsx(Markdown, { children: `To update Millennium to ${millenniumUpdates?.newVersion?.tag_name}, run the following command in your terminal:\n\n\`${window.PLUGIN_LIST[pluginName].millenniumLinuxUpdateScript}\`` }), bAlertDialog: true }), window.PLUGIN_LIST[pluginName].mainWindow, { bNeverPopOut: false });
        };
        if (isUpdateInProgress) {
            return null;
        }
        function VersionInformation() {
            return [
                'Millennium',
                jsxRuntime.jsxs("div", { className: "MillenniumItem_Version", children: [window.PLUGIN_LIST[pluginName].version, " ", '->', " ", millenniumUpdates?.newVersion?.tag_name] }),
            ];
        }
        return [
            jsxRuntime.jsx(SettingsDialogSubHeader, { children: "Millennium" }),
            jsxRuntime.jsx(UpdateCard, { update: {
                    name: VersionInformation(),
                    message: millenniumUpdates?.newVersion?.body,
                    date: Utils.toTimeAgo(millenniumUpdates?.newVersion?.published_at),
                    commit: millenniumUpdates?.newVersion?.html_url,
                }, index: 0, totalCount: 1, isUpdating: false, progress: 0, statusText: String(), onUpdateClick: () => {
                    if (window.PLUGIN_LIST[pluginName].platformType === OSType.Windows) {
                        updateMillennium();
                        startUpdateWindows();
                    }
                    else if (window.PLUGIN_LIST[pluginName].platformType === OSType.Linux) {
                        startUpdateLinux();
                    }
                }, toolTipText: 'Millennium to ' + millenniumUpdates?.newVersion?.tag_name }),
        ];
    };

    const updateListeners = new Set();
    const NotifyUpdateListeners = () => {
        updateListeners.forEach((callback) => callback());
    };
    const UpdateContext = React.createContext(null);
    class UpdateContextProvider extends React.Component {
        constructor(props) {
            super(props);
            this.setUpdatingPlugins = (updater) => {
                return this.setState((prevState) => {
                    return { updatingPlugins: updater(prevState.updatingPlugins) };
                });
            };
            this.setUpdatingThemes = (updater) => {
                return this.setState((prevState) => ({
                    updatingThemes: updater(prevState.updatingThemes),
                }));
            };
            this.isAnyUpdating = () => {
                const { updatingThemes, updatingPlugins } = this.state;
                return updatingThemes.some((u) => u) || updatingPlugins.some((u) => u);
            };
            this.hasAnyUpdates = () => {
                const { themeUpdates, pluginUpdates } = this.state;
                return (themeUpdates?.length ?? 0) > 0 || pluginUpdates?.some((update) => update?.hasUpdate);
            };
            this.forceFetchUpdates = async () => {
                const updates = JSON.parse(await PyResyncUpdates());
                window.PLUGIN_LIST[pluginName].updates.themes = updates.themes;
                window.PLUGIN_LIST[pluginName].updates.plugins = updates.plugins;
                NotifyUpdateListeners();
            };
            this.parseUpdateErrorMessage = () => {
                const themeError = window.PLUGIN_LIST[pluginName]?.updates?.themes?.error || '';
                const pluginError = window.PLUGIN_LIST[pluginName]?.updates?.plugins?.error || '';
                if (themeError && pluginError)
                    return `${themeError}\n${pluginError}`;
                return themeError || pluginError;
            };
            this.fetchAvailableUpdates = async (force = false) => {
                try {
                    if (force || !window.PLUGIN_LIST[pluginName].hasCheckedForUpdates) {
                        await this.forceFetchUpdates();
                        window.PLUGIN_LIST[pluginName].hasCheckedForUpdates = true;
                    }
                    window.PLUGIN_LIST[pluginName].connectionFailed = false;
                    this.setState({
                        themeUpdates: window.PLUGIN_LIST[pluginName].updates.themes,
                        pluginUpdates: window.PLUGIN_LIST[pluginName].updates.plugins,
                        hasUpdateError: Boolean(window.PLUGIN_LIST[pluginName]?.updates?.themes?.error || window.PLUGIN_LIST[pluginName]?.updates?.plugins?.error),
                        hasReceivedUpdates: true,
                    });
                    return true;
                }
                catch (exception) {
                    window.PLUGIN_LIST[pluginName].connectionFailed = true;
                    return false;
                }
            };
            this.state = {
                updatingThemes: [],
                updatingPlugins: [],
                themeUpdates: null,
                pluginUpdates: null,
                hasReceivedUpdates: false,
                hasUpdateError: false,
            };
        }
        componentDidMount() {
            this.fetchAvailableUpdates();
        }
        render() {
            const { updatingThemes, updatingPlugins, hasReceivedUpdates, hasUpdateError } = this.state;
            if (hasUpdateError) {
                return (jsxRuntime.jsx(Placeholder, { icon: jsxRuntime.jsx(client.IconsModule.ExclamationPoint, {}), header: locale.updatePanelErrorHeader, body: locale.updatePanelErrorBody + this.parseUpdateErrorMessage(), children: jsxRuntime.jsx(client.DialogButton, { className: settingsClasses.SettingsDialogButton, onClick: this.fetchAvailableUpdates.spread(true), children: locale.updatePanelErrorButton }) }));
            }
            if (!hasReceivedUpdates)
                return jsxRuntime.jsx(client.SteamSpinner, { background: "transparent" });
            if (!this.hasAnyUpdates()) {
                return jsxRuntime.jsx(Placeholder, { icon: jsxRuntime.jsx(client.IconsModule.Checkmark, {}), header: locale.updatePanelNoUpdatesFoundHeader, body: locale.updatePanelNoUpdatesFound });
            }
            return (jsxRuntime.jsx(UpdateContext.Provider, { value: {
                    updatingThemes,
                    updatingPlugins,
                    themeUpdates: this.state.themeUpdates,
                    pluginUpdates: this.state.pluginUpdates,
                    hasReceivedUpdates: this.state.hasReceivedUpdates,
                    hasUpdateError: this.state.hasUpdateError,
                    setUpdatingThemes: this.setUpdatingThemes,
                    setUpdatingPlugins: this.setUpdatingPlugins,
                    isAnyUpdating: this.isAnyUpdating,
                    fetchAvailableUpdates: this.fetchAvailableUpdates,
                }, children: this.props.children }));
        }
    }
    const useUpdateContext = () => {
        const context = React.useContext(UpdateContext);
        if (!context)
            throw new Error('Digitaldepot: useUpdateContext must be used inside UpdateContextProvider');
        return context;
    };

    async function StartThemeUpdate(ctx, setUpdateState, updateObject, index) {
        const { setUpdatingThemes, isAnyUpdating, fetchAvailableUpdates } = ctx;
        if (isAnyUpdating())
            return;
        setUpdatingThemes((prev) => produce(prev, (draft) => {
            draft[index] = true;
        }));
        await setUpdateState({
            statusText: locale.strUpdatingTheme,
            progress: 30,
            uxSleepLength: 1000,
        });
        const updateSuccess = await PyUpdateTheme({ native: updateObject.native });
        if (updateSuccess) {
            await setUpdateState({
                statusText: locale.strFinishedUpdating,
                progress: 100,
                uxSleepLength: 1000,
            });
            await fetchAvailableUpdates(true);
            const activeTheme = window.PLUGIN_LIST[pluginName].activeTheme;
            const reload = await Utils.ShowMessageBox(formatString(activeTheme?.native === updateObject?.native ? locale.updateSuccessfulRestart : locale.updateSuccessful, updateObject?.name), SteamLocale('#ImageUpload_SuccessCard'));
            if (activeTheme?.native === updateObject?.native && reload) {
                SteamClient.Browser.RestartJSContext();
            }
        }
        else {
            Utils.ShowMessageBox(formatString(locale.updateFailed, updateObject?.name), SteamLocale('#Generic_Error'));
        }
        setUpdatingThemes((prev) => produce(prev, (draft) => {
            draft[index] = false;
        }));
    }
    function ThemeUpdateCard({ themeUpdates }) {
        if (!themeUpdates || !themeUpdates.length)
            return null;
        const ctx = useUpdateContext();
        const [updateState, setUpdateState] = React.useState(null);
        const setNewState = async (newState) => {
            setUpdateState(newState);
            return await client.sleep(newState.uxSleepLength);
        };
        return [
            jsxRuntime.jsx(SettingsDialogSubHeader, { children: "Themes" }),
            themeUpdates?.map((update, index) => (jsxRuntime.jsx(UpdateCard, { update: update, index: index, totalCount: themeUpdates.length, isUpdating: ctx.updatingThemes[index], progress: updateState?.progress, statusText: updateState?.statusText, onUpdateClick: StartThemeUpdate.spread(ctx, setNewState, update, index) }))),
        ];
    }

    const FindPluginByName = async (pluginName) => {
        const allPlugins = JSON.parse(await PyFindAllPlugins());
        return allPlugins.find((plugin) => plugin.data.name === pluginName);
    };
    const StartPluginUpdate = async (ctx, setUpdateState, updateObject, index) => {
        const { setUpdatingPlugins, isAnyUpdating, fetchAvailableUpdates } = ctx;
        if (isAnyUpdating())
            return;
        setUpdatingPlugins((prev) => produce(prev, (draft) => {
            draft[index] = !draft[index];
        }));
        await setUpdateState({
            statusText: locale.strPreparing,
            progress: 10,
            uxSleepLength: 1000,
        });
        /** Generally unsafe to try to update the plugin when its running, so we prevent that */
        if ((await FindPluginByName(updateObject?.pluginInfo?.pluginJson?.name))?.enabled) {
            await Utils.ShowMessageBox(formatString(locale.updateFailedPluginRunning, updateObject?.pluginInfo?.pluginJson?.common_name), locale.HoldOn, {
                bAlertDialog: true,
            });
            setUpdatingPlugins((prev) => produce(prev, (draft) => {
                draft[index] = false;
            }));
            return;
        }
        await setUpdateState({
            statusText: locale.strUpdatingPlugin,
            progress: 60,
            uxSleepLength: 1000,
        });
        const updateSuccess = await PyUpdatePlugin({ id: updateObject?.id, name: updateObject?.pluginDirectory });
        await setUpdateState({
            statusText: locale.strComplete,
            progress: 100,
            uxSleepLength: 1000,
        });
        if (updateSuccess) {
            await fetchAvailableUpdates(true);
        }
        else {
            Utils.ShowMessageBox(formatString(locale.updateFailed, updateObject?.name), SteamLocale('#Generic_Error'), {
                bAlertDialog: true,
            });
        }
        setUpdatingPlugins((prev) => produce(prev, (draft) => {
            draft[index] = false;
        }));
    };
    function PluginUpdateCard({ pluginUpdates }) {
        if (!pluginUpdates || !pluginUpdates.length)
            return null;
        const ctx = useUpdateContext();
        const [updateState, setUpdateState] = React.useState(null);
        const setNewState = async (newState) => {
            setUpdateState(newState);
            return await client.sleep(newState.uxSleepLength);
        };
        return [
            jsxRuntime.jsx(SettingsDialogSubHeader, { children: "Plugins" }),
            pluginUpdates?.map((update, index) => (jsxRuntime.jsx(UpdateCard, { update: {
                    name: update?.pluginInfo?.pluginJson?.common_name,
                    message: update?.commitMessage,
                    date: Utils.toTimeAgo(update?.pluginInfo?.commitDate),
                    commit: update?.pluginInfo?.commit,
                }, index: index, totalCount: pluginUpdates.length, isUpdating: ctx.updatingPlugins[index], progress: updateState?.progress, statusText: updateState?.statusText, onUpdateClick: () => StartPluginUpdate(ctx, setNewState, update, index) }))),
        ];
    }

    const RenderAvailableUpdates = ({ millenniumUpdates, themeUpdates, pluginUpdates }) => {
        return (jsxRuntime.jsxs(client.DialogControlsSection, { children: [MillenniumUpdateCard({ millenniumUpdates }), ThemeUpdateCard({ themeUpdates }), PluginUpdateCard({ pluginUpdates })] }));
    };
    const UpdatesViewModal = () => {
        const { themeUpdates, pluginUpdates } = useUpdateContext();
        return (jsxRuntime.jsx(RenderAvailableUpdates, { millenniumUpdates: window.PLUGIN_LIST[pluginName].MillenniumUpdates, themeUpdates: themeUpdates, pluginUpdates: pluginUpdates?.filter((update) => update?.hasUpdate) }));
    };

    const tabSpotGeneral = {
        visible: true,
        title: locale.settingsPanelGeneral,
        icon: jsxRuntime.jsx(MillenniumIcons.SteamBrewLogo, {}),
        content: (jsxRuntime.jsx(client.DialogBody, { className: client.Classes.SettingsDialogBodyFade, children: jsxRuntime.jsx(GeneralViewModal, {}) })),
        route: '/millennium/settings/general',
    };
    const tabSpotThemes = {
        visible: false,
        title: locale.settingsPanelThemes,
        icon: jsxRuntime.jsx(FaPaintRoller, { style: { height: '20px', width: '20px' } }),
        content: (jsxRuntime.jsx(client.DialogBody, { className: client.Classes.SettingsDialogBodyFade, children: jsxRuntime.jsx(ThemeViewModal, {}) })),
        route: '/millennium/settings/themes',
    };
    const tabSpotPlugins = {
        visible: false,
        title: locale.settingsPanelPlugins,
        icon: jsxRuntime.jsx(PiPlugsFill, { style: { height: '20px', width: '20px' } }),
        content: (jsxRuntime.jsx(client.DialogBody, { className: client.Classes.SettingsDialogBodyFade, children: jsxRuntime.jsx(PluginViewModal, {}) })),
        route: '/millennium/settings/plugins',
    };
    const tabSpotUpdates = {
        visible: false,
        title: locale.settingsPanelUpdates,
        icon: jsxRuntime.jsx(client.IconsModule.Update, {}),
        content: (jsxRuntime.jsx(client.DialogBody, { className: client.Classes.SettingsDialogBodyFade, children: jsxRuntime.jsx(UpdateContextProvider, { children: jsxRuntime.jsx(UpdatesViewModal, {}) }) })),
        route: '/millennium/settings/updates',
    };
    const tabSpotLogs = {
        visible: true,
        title: locale.settingsPanelLogs,
        icon: jsxRuntime.jsx(client.IconsModule.TextCodeBlock, {}),
        content: (jsxRuntime.jsx(client.DialogBody, { className: client.Classes.SettingsDialogBodyFade, children: jsxRuntime.jsx(RenderLogViewer, {}) })),
        route: '/millennium/settings/logs',
    };
    function MillenniumSettings() {
        const className = `${settingsClasses.SettingsModal} ${settingsClasses.DesktopPopup} MillenniumSettings ModalDialogPopup`;
        const settingsPages = [tabSpotGeneral, 'separator', tabSpotThemes, tabSpotPlugins, 'separator', tabSpotUpdates, tabSpotLogs];
        return (jsxRuntime.jsxs(ConfigProvider, { children: [jsxRuntime.jsx(Styles, {}), jsxRuntime.jsx(client.SidebarNavigation, { className: className, pages: settingsPages, title: 'Digitaldepot' })] }));
    }
    function RenderSettingsModal(_, retObj) {
        console.log('[RenderSettingsModal] Called');
        console.log('[RenderSettingsModal] retObj:', retObj);
        console.log('[RenderSettingsModal] menuItems:', retObj.props?.menuItems);
        if (retObj.props?.menuItems) {
            const menuItemNames = retObj.props.menuItems.map((m) => m.name);
            console.log('[RenderSettingsModal] Menu item names:', menuItemNames);
        }
        const index = retObj.props.menuItems.findIndex((prop) => prop.name === '#Menu_Settings');
        console.log('[RenderSettingsModal] Found #Menu_Settings at index:', index);
        if (index !== -1) {
            console.log('[RenderSettingsModal] Adding Millennium menu item...');
            retObj.props.menuItems.splice(index + 1, 0, {
                name: 'Digitaldepot',
                onClick: () => {
                    console.log('[RenderSettingsModal] Millennium menu clicked!');
                    client.Navigation.Navigate('/millennium/settings');
                },
                visible: true,
            });
            console.log('[RenderSettingsModal] Menu item added. New count:', retObj.props.menuItems.length);
        }
        else {
            console.error('[RenderSettingsModal] #Menu_Settings not found!');
        }
        return retObj.type(retObj.props);
    }

    /**
     * ==================================================
     *   _____ _ _ _             _
     *  |     |_| | |___ ___ ___|_|_ _ _____
     *  | | | | | | | -_|   |   | | | |     |
     *  |_|_|_|_|_|_|___|_|_|_|_|_|___|_|_|_|
     *
     * ==================================================
     *
     * Copyright (c) 2025 Project Millennium
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in all
     * copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     * SOFTWARE.
     */
    function PatchRootMenu() {
        console.log('[PatchRootMenu] Starting root menu patch...');
        try {
            const rootElement = document.getElementById('root');
            console.log('[PatchRootMenu] Root element:', rootElement);
            if (!rootElement) {
                console.error('[PatchRootMenu] Root element not found!');
                return;
            }
            const reactRoot = client.getReactRoot(rootElement);
            console.log('[PatchRootMenu] React root:', reactRoot);
            if (!reactRoot) {
                console.error('[PatchRootMenu] React root not found!');
                return;
            }
            const steamRootMenu = client.findInReactTree(reactRoot, (m) => {
                const matches = m?.pendingProps?.title === 'Steam' && m?.pendingProps?.menuContent;
                if (matches) {
                    console.log('[PatchRootMenu] Found Steam root menu:', m);
                }
                return matches;
            });
            if (!steamRootMenu) {
                console.error('[PatchRootMenu] Steam root menu not found in React tree!');
                return;
            }
            console.log('[PatchRootMenu] Steam root menu found, applying patch...');
            console.log('[PatchRootMenu] menuContent:', steamRootMenu.pendingProps.menuContent);
            client.afterPatch(steamRootMenu.pendingProps.menuContent, 'type', RenderSettingsModal);
            console.log('[PatchRootMenu] Patch applied successfully!');
        }
        catch (error) {
            console.error('[PatchRootMenu] Error:', error);
        }
    }

    const EvaluateModule = (module, type, document) => {
        const activeTheme = window.PLUGIN_LIST[pluginName].activeTheme;
        switch (type) {
            case ConditionalControlFlowType.TargetCss:
                DOMModifier.AddStyleSheet(document, constructThemePath(activeTheme.native, module));
                break;
            case ConditionalControlFlowType.TargetJs:
                DOMModifier.AddJavaScript(document, constructThemePath(activeTheme.native, module));
                break;
        }
    };
    /**
     * @brief evaluates list of; or single module
     *
     * @param module module(s) to be injected into the frame
     * @param type the type of the module
     * @returns null
     */
    const SanitizeTargetModule = (module, type, document) => {
        if (module === undefined) {
            return;
        }
        else if (typeof module === 'string') {
            EvaluateModule(module, type, document);
        }
        else if (Array.isArray(module)) {
            module.forEach((node) => EvaluateModule(node, type, document));
        }
    };
    const EvaluatePatches = (activeTheme, documentTitle, classList, document, popup) => {
        activeTheme.data.Patches.forEach((patch) => {
            const match = patch.MatchRegexString;
            popup.window.HAS_INJECTED_THEME = true;
            if (!documentTitle.match(match) && !classListMatch(classList, match)) {
                return;
            }
            SanitizeTargetModule(patch?.TargetCss, ConditionalControlFlowType.TargetCss, document);
            SanitizeTargetModule(patch?.TargetJs, ConditionalControlFlowType.TargetJs, document);
            // backwards compatibility with old Digitaldepot versions.
            const PatchV1 = patch;
            if (window.PLUGIN_LIST[pluginName].conditionVersion == 1 && PatchV1?.Statement !== undefined) {
                EvaluateStatements(PatchV1, document);
            }
        });
    };
    /**
     * parses all classnames from a window and concatenates into one list
     * @param context window context from g_popupManager
     * @returns
     */
    const getDocumentClassList = (context) => {
        const bodyClass = context?.params?.body_class ?? String();
        const htmlClass = context?.params?.html_class ?? String();
        return `${bodyClass} ${htmlClass}`.split(' ').map((className) => '.' + className);
    };
    function patchDocumentContext(windowContext) {
        const document = windowContext.window.document;
        for (const plugin of window.PLUGIN_LIST[pluginName].enabledPlugins) {
            document.documentElement.classList.add(plugin);
        }
        document.documentElement.setAttribute('data-millennium-plugin', window.PLUGIN_LIST[pluginName]?.enabledPlugins?.join(' '));
        if (window.PLUGIN_LIST[pluginName].isDefaultTheme) {
            return;
        }
        const activeTheme = window.PLUGIN_LIST[pluginName].activeTheme;
        const classList = getDocumentClassList(windowContext);
        const documentTitle = windowContext.title;
        // Append System Accent Colors to global document (publicly shared)
        DOMModifier.AddStyleSheetFromText(document, window.PLUGIN_LIST[pluginName].systemColor, 'SystemAccentColorInject');
        // Append old global colors struct to DOM
        window.PLUGIN_LIST[pluginName]?.GlobalsColors && DOMModifier.AddStyleSheetFromText(document, window.PLUGIN_LIST[pluginName].GlobalsColors, 'GlobalColors');
        if (activeTheme?.data?.Conditions) {
            window.PLUGIN_LIST[pluginName].conditionVersion = 2;
            EvaluateConditions(activeTheme, documentTitle, classList, document);
        }
        else {
            window.PLUGIN_LIST[pluginName].conditionVersion = 1;
        }
        activeTheme?.data?.hasOwnProperty('Patches') && EvaluatePatches(activeTheme, documentTitle, classList, document, windowContext);
        /** Inject root colors */
        window.PLUGIN_LIST[pluginName]?.RootColors && DOMModifier.AddStyleSheetFromText(document, window.PLUGIN_LIST[pluginName].RootColors, 'RootColors');
    }
    function patchMissedDocuments() {
        for (const popup of g_PopupManager?.GetPopups()) {
            if (popup?.window?.HAS_INJECTED_THEME === undefined) {
                patchDocumentContext(popup);
            }
        }
    }
    function onWindowCreatedCallback(windowContext) {
        const windowTitle = windowContext.m_strTitle;
        console.log('[Millennium] Window created:', windowTitle);
        /** Patch the steam root menu to add the Millennium root menu */
        if (windowTitle === 'Steam Root Menu') {
            console.log('[Millennium] Steam Root Menu detected, patching...');
            try {
                PatchRootMenu();
                console.log('[Millennium] Root menu patch completed');
            }
            catch (error) {
                console.error('[Millennium] Error patching root menu:', error);
            }
        }
        window.PLUGIN_LIST[pluginName].mainWindow = g_PopupManager?.GetExistingPopup?.('SP Desktop_uid0')?.m_popup?.window;
        patchMissedDocuments();
        patchDocumentContext(windowContext);
    }

    /**
     * Notify the user about available updates in their library.
     * This method checks for theme and plugin updates and displays a notification if any are found.
     */
    class NotificationService {
        get libraryUpdateCount() {
            const themeUpdates = window.PLUGIN_LIST[pluginName].updates.themes;
            const pluginUpdates = window.PLUGIN_LIST[pluginName].updates.plugins;
            return themeUpdates?.length + pluginUpdates?.filter?.((update) => update?.hasUpdate)?.length || 0;
        }
        async notifyLibraryUpdates() {
            await client.sleep(1000); // Wait for the toaster to be ready
            if (this.libraryUpdateCount === 0) {
                Logger.Log('No updates found, skipping notification.');
                return;
            }
            client.toaster.toast({
                title: `Updates Available`,
                body: `We've found ${this.libraryUpdateCount} updates for items in your library!`,
                logo: jsxRuntime.jsx(client.IconsModule.Download, {}),
                onClick: () => {
                    client.Navigation.Navigate('/millennium/settings/updates');
                },
            });
        }
        async notifyMillenniumUpdates() {
            await client.sleep(1000); // Wait for the toaster to be ready
            client.toaster.toast({
                title: `Millennium Update Available`,
                body: `A new version of Millennium is available! Click here to update.`,
                logo: jsxRuntime.jsx(MillenniumIcons.SteamBrewLogo, {}),
                onClick: () => {
                    client.Navigation.Navigate('/millennium/settings/updates');
                },
            });
        }
        constructor() {
            this.shouldNotifyLibraryUpdates = settingsManager.config.general.shouldShowThemePluginUpdateNotifications;
            this.onMillenniumUpdates = settingsManager.config.general.onMillenniumUpdate;
        }
        async showNotifications() {
            await client.sleep(3000); // Wait for the toaster to be ready
            if (this.shouldNotifyLibraryUpdates) {
                this.notifyLibraryUpdates();
            }
            if (!window.PLUGIN_LIST[pluginName]?.millenniumUpdates?.hasUpdate) {
                Logger.Log('No Millennium updates found, skipping notification.');
                return;
            }
            switch (this.onMillenniumUpdates) {
                case OnMillenniumUpdate.AUTO_INSTALL: {
                    updateMillennium();
                    break;
                }
                case OnMillenniumUpdate.NOTIFY: {
                    this.notifyMillenniumUpdates();
                    break;
                }
                case OnMillenniumUpdate.DO_NOTHING:
                default: {
                    Logger.Log('Millennium updates are set to do nothing.');
                    break;
                }
            }
        }
    }

    const DesktopMenuContext = React.createContext(undefined);
    const DesktopMenuProvider = ({ children }) => {
        const [isOpen, setIsOpen] = React.useState(false);
        const [activePlugin, setActivePluginState] = React.useState(undefined);
        const [plugins, setPlugins] = React.useState(undefined);
        React.useEffect(() => {
            PyFindAllPlugins().then((pluginsJson) => {
                setPlugins(JSON.parse(pluginsJson));
            });
        }, []);
        const openMenu = React.useCallback(() => {
            setActivePluginState(undefined);
            setIsOpen(true);
        }, []);
        const closeMenu = React.useCallback(() => {
            setIsOpen(false);
        }, []);
        const toggleMenu = React.useCallback(() => {
            setIsOpen((prev) => !prev);
        }, [isOpen]);
        const setActivePlugin = React.useCallback((plugin) => {
            setActivePluginState(plugin);
        }, []);
        const value = React.useMemo(() => ({
            isOpen,
            activePlugin,
            plugins,
            toggleMenu,
            setActivePlugin,
            closeMenu,
            openMenu,
        }), [isOpen, activePlugin, plugins, toggleMenu, setActivePlugin, closeMenu, openMenu]);
        return jsxRuntime.jsx(DesktopMenuContext.Provider, { value: value, children: children });
    };
    const useDesktopMenu = () => {
        const context = React.useContext(DesktopMenuContext);
        if (context === undefined) {
            throw new Error('useDesktopMenu must be used within a DesktopMenuProvider');
        }
        return context;
    };

    // THIS FILE IS AUTO GENERATED
    function BsGearFill (props) {
      return GenIcon({"attr":{"fill":"currentColor","viewBox":"0 0 16 16"},"child":[{"tag":"path","attr":{"d":"M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"},"child":[]}]})(props);
    }

    const TitleView = () => {
        const { closeMenu, activePlugin, setActivePlugin } = useDesktopMenu();
        const onSettingsClick = () => {
            client.Navigation.Navigate('/Digitaldepot/settings');
            closeMenu();
        };
        if (!activePlugin) {
            return (jsxRuntime.jsxs(client.Focusable, { className: client.joinClassNames('DigitaldepotDesktopSidebar_Title', client.quickAccessMenuClasses.Title), children: [jsxRuntime.jsx("div", { children: "Digitaldepot" }), jsxRuntime.jsx(IconButton, { onClick: onSettingsClick, style: { marginLeft: 'auto' }, children: jsxRuntime.jsx(BsGearFill, {}) })] }));
        }
        return (jsxRuntime.jsxs(client.Focusable, { className: client.joinClassNames('DigitaldepotDesktopSidebar_Title', client.quickAccessMenuClasses.Title), children: [jsxRuntime.jsx(IconButton, { onClick: setActivePlugin.bind(null, null), children: jsxRuntime.jsx(FaArrowLeft, {}) }), getPluginView(activePlugin?.data?.name)?.titleView || jsxRuntime.jsx("div", { children: activePlugin?.data?.common_name })] }));
    };

    const RenderPluginViews = ({ plugins, pluginName, pluginView }) => {
        const { setActivePlugin } = useDesktopMenu();
        const plugin = plugins?.find((p) => p.data.name === pluginName);
        return (jsxRuntime.jsx(client.PanelSectionRow, { children: jsxRuntime.jsx(client.DialogButton, { style: { padding: '0px 10px 0px 10px', width: '-webkit-fill-available' }, onClick: setActivePlugin.spread(plugin), children: jsxRuntime.jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '10px' }, children: [jsxRuntime.jsx("div", { className: "iconContainer", children: pluginView?.icon }), jsxRuntime.jsx("div", { children: plugin?.data?.common_name })] }) }) }, pluginName));
    };
    const RenderPluginView = () => {
        const { activePlugin } = useDesktopMenu();
        const renderer = getPluginView(activePlugin?.data?.name)?.content;
        if (!renderer) {
            return (jsxRuntime.jsx(client.PanelSection, { children: jsxRuntime.jsxs(client.PanelSectionRow, { children: ["Failed to find a renderer for ", jsxRuntime.jsx("b", { children: activePlugin?.data?.name }), ". Please check if the plugin is loaded correctly."] }) }));
        }
        return jsxRuntime.jsx(client.ErrorBoundary, { children: renderer });
    };
    const PluginSelectorView = () => {
        const { plugins } = useDesktopMenu();
        const pluginRenderers = getPluginRenderers();
        if (!pluginRenderers || Object.keys(pluginRenderers).length === 0) {
            return (jsxRuntime.jsx(Placeholder, { icon: jsxRuntime.jsx(client.IconsModule.TextCode, {}), header: "No configurable plugins", body: "Configurable plugins will appear here. No loaded plugins are currently configurable." }));
        }
        return (jsxRuntime.jsx(client.PanelSection, { children: Object.entries(pluginRenderers)?.map(([key, panel]) => (jsxRuntime.jsx(RenderPluginViews, { plugins: plugins, pluginName: key, pluginView: panel }, key))) }));
    };

    /**
     * ==================================================
     *   _____ _ _ _             _
     *  |     |_| | |___ ___ ___|_|_ _ _____
     *  | | | | | | | -_|   |   | | | |     |
     *  |_|_|_|_|_|_|___|_|_|_|_|_|___|_|_|_|
     *
     * ==================================================
     *
     * Copyright (c) 2025 Project Digitaldepot
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in all
     * copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     * SOFTWARE.
     */
    /**
     * BrowserManagerHook is a utility class that hooks into the MainWindowBrowserManager
     * to hide it when the DigitaldepotSidebar is open.
     *
     * The main browser window is a child HWND of the main steam window. It's directly rendered on top of the main steam window, they are separate windows, not one in the same.
     * This means if the DigitaldepotSidebar is open, it would be covering the browser window, which is not ideal.
     *
     * This is a decent solution that hides the browser, then screenshots it and display it as a background when the sidebar is open.
     */
    class BrowserManagerHook {
        constructor() {
            this.shouldBlockRequest = false;
            this.inputBlockerClass = client.findClassModule((m) => m.BrowserWrapper && m.Browser) || {};
        }
        async captureBrowserSnapshot() {
            const targetInfos = await client.ChromeDevToolsProtocol.send('Target.getTargets');
            const browserTarget = targetInfos?.targetInfos?.find((target) => target?.url === MainWindowBrowserManager.m_URL);
            const attachedTarget = await client.ChromeDevToolsProtocol.send('Target.attachToTarget', {
                targetId: browserTarget?.targetId,
                flatten: true,
            });
            const screenshot = await client.ChromeDevToolsProtocol.send('Page.captureScreenshot', {
                format: 'jpeg',
                quality: 75,
            }, attachedTarget?.sessionId);
            return `data:image/jpeg;base64,${screenshot?.data}`;
        }
        async setBrowserVisible(windowRef, visible) {
            if (!MainWindowBrowserManager?.m_lastLocation?.pathname.startsWith('/browser/')) {
                return;
            }
            const inputBlocker = windowRef?.document?.getElementsByClassName(this.inputBlockerClass.Browser)[0];
            if (inputBlocker && !visible) {
                const snapShot = await this.captureBrowserSnapshot();
                inputBlocker.style.setProperty('-valve-app-region', visible ? '' : 'unset');
                inputBlocker.style.background = `url(${snapShot}) no-repeat center center`;
                inputBlocker.style.backgroundSize = '100% auto';
            }
            /** Give the snapshot image some time to load in to prevent flickering */
            !visible && (await client.sleep(50));
            if (typeof MainWindowBrowserManager !== 'undefined') {
                if (this.setBrowserVisiblePatched?.original && typeof this.setBrowserBoundsPatched?.original === 'function') {
                    this.setBrowserVisiblePatched.original(visible);
                }
                else {
                    console.warn('Not hooked yet, falling back to original SetVisible');
                    MainWindowBrowserManager?.m_browser?.SetVisible(visible);
                }
            }
            // Remove the pseudo background when dismounting
            if (inputBlocker && visible) {
                await client.sleep(50); // No rush to remove the background its not visible anyway
                inputBlocker.style.background = '';
            }
        }
        setBoundsHookCb() {
            return this.shouldBlockRequest ? null : client.callOriginal;
        }
        setVisibleHookCb() {
            return this.shouldBlockRequest ? null : client.callOriginal;
        }
        async hook(skipCheckHealth = false) {
            while (typeof MainWindowBrowserManager === 'undefined' ||
                MainWindowBrowserManager?.m_browser?.SetBounds === undefined ||
                MainWindowBrowserManager?.m_browser?.SetVisible === undefined) {
                await client.sleep(10);
            }
            this.setBrowserBoundsPatched = client.replacePatch(MainWindowBrowserManager.m_browser, 'SetBounds', this.setBoundsHookCb.bind(this));
            this.setBrowserVisiblePatched = client.replacePatch(MainWindowBrowserManager.m_browser, 'SetVisible', this.setVisibleHookCb.bind(this));
            if (!skipCheckHealth) {
                this.hookHealthCheck();
            }
        }
        async unhook() {
            this.setBrowserBoundsPatched?.unpatch();
            this.setBrowserVisiblePatched?.unpatch();
        }
        setShouldBlockRequest(block) {
            this.shouldBlockRequest = block;
        }
        /** It seems the SetBounds and SetVisible are re-instantiated sometimes, which overrides our patch */
        hookHealthCheck() {
            const interval = setInterval(() => {
                const browser = MainWindowBrowserManager?.m_browser;
                if (browser?.SetBounds !== this.setBrowserBoundsPatched.patchedFunction || browser?.SetVisible !== this.setBrowserVisiblePatched.patchedFunction) {
                    this.hook(true);
                }
            }, 100);
            setTimeout(() => clearInterval(interval), 10000);
        }
    }

    const createStoreImpl = (createState) => {
      let state;
      const listeners = /* @__PURE__ */ new Set();
      const setState = (partial, replace) => {
        const nextState = typeof partial === "function" ? partial(state) : partial;
        if (!Object.is(nextState, state)) {
          const previousState = state;
          state = (replace != null ? replace : typeof nextState !== "object") ? nextState : Object.assign({}, state, nextState);
          listeners.forEach((listener) => listener(state, previousState));
        }
      };
      const getState = () => state;
      const subscribe = (listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
      };
      const destroy = () => {
        if ((undefined ? undefined.MODE : void 0) !== "production") {
          console.warn(
            "[DEPRECATED] The `destroy` method will be unsupported in a future version. Instead use unsubscribe function returned by subscribe. Everything will be garbage-collected if store is garbage-collected."
          );
        }
        listeners.clear();
      };
      const api = { setState, getState, subscribe, destroy };
      state = createState(setState, getState, api);
      return api;
    };
    const createStore = (createState) => createState ? createStoreImpl(createState) : createStoreImpl;

    var withSelector = {exports: {}};

    var withSelector_production_min = {};

    var shim = {exports: {}};

    var useSyncExternalStoreShim_production_min = {};

    /**
     * @license React
     * use-sync-external-store-shim.production.min.js
     *
     * Copyright (c) Facebook, Inc. and its affiliates.
     *
     * This source code is licensed under the MIT license found in the
     * LICENSE file in the root directory of this source tree.
     */

    var hasRequiredUseSyncExternalStoreShim_production_min;

    function requireUseSyncExternalStoreShim_production_min () {
    	if (hasRequiredUseSyncExternalStoreShim_production_min) return useSyncExternalStoreShim_production_min;
    	hasRequiredUseSyncExternalStoreShim_production_min = 1;
    var e=React;function h(a,b){return a===b&&(0!==a||1/a===1/b)||a!==a&&b!==b}var k="function"===typeof Object.is?Object.is:h,l=e.useState,m=e.useEffect,n=e.useLayoutEffect,p=e.useDebugValue;function q(a,b){var d=b(),f=l({inst:{value:d,getSnapshot:b}}),c=f[0].inst,g=f[1];n(function(){c.value=d;c.getSnapshot=b;r(c)&&g({inst:c});},[a,d,b]);m(function(){r(c)&&g({inst:c});return a(function(){r(c)&&g({inst:c});})},[a]);p(d);return d}
    	function r(a){var b=a.getSnapshot;a=a.value;try{var d=b();return !k(a,d)}catch(f){return  true}}function t(a,b){return b()}var u="undefined"===typeof window||"undefined"===typeof window.document||"undefined"===typeof window.document.createElement?t:q;useSyncExternalStoreShim_production_min.useSyncExternalStore=void 0!==e.useSyncExternalStore?e.useSyncExternalStore:u;
    	return useSyncExternalStoreShim_production_min;
    }

    var hasRequiredShim;

    function requireShim () {
    	if (hasRequiredShim) return shim.exports;
    	hasRequiredShim = 1;

    	{
    	  shim.exports = requireUseSyncExternalStoreShim_production_min();
    	}
    	return shim.exports;
    }

    /**
     * @license React
     * use-sync-external-store-shim/with-selector.production.min.js
     *
     * Copyright (c) Facebook, Inc. and its affiliates.
     *
     * This source code is licensed under the MIT license found in the
     * LICENSE file in the root directory of this source tree.
     */

    var hasRequiredWithSelector_production_min;

    function requireWithSelector_production_min () {
    	if (hasRequiredWithSelector_production_min) return withSelector_production_min;
    	hasRequiredWithSelector_production_min = 1;
    var h=React,n=requireShim();function p(a,b){return a===b&&(0!==a||1/a===1/b)||a!==a&&b!==b}var q="function"===typeof Object.is?Object.is:p,r=n.useSyncExternalStore,t=h.useRef,u=h.useEffect,v=h.useMemo,w=h.useDebugValue;
    	withSelector_production_min.useSyncExternalStoreWithSelector=function(a,b,e,l,g){var c=t(null);if(null===c.current){var f={hasValue:false,value:null};c.current=f;}else f=c.current;c=v(function(){function a(a){if(!c){c=true;d=a;a=l(a);if(void 0!==g&&f.hasValue){var b=f.value;if(g(b,a))return k=b}return k=a}b=k;if(q(d,a))return b;var e=l(a);if(void 0!==g&&g(b,e))return b;d=a;return k=e}var c=false,d,k,m=void 0===e?null:e;return [function(){return a(b())},null===m?void 0:function(){return a(m())}]},[b,e,l,g]);var d=r(a,c[0],c[1]);
    	u(function(){f.hasValue=true;f.value=d;},[d]);w(d);return d};
    	return withSelector_production_min;
    }

    var hasRequiredWithSelector;

    function requireWithSelector () {
    	if (hasRequiredWithSelector) return withSelector.exports;
    	hasRequiredWithSelector = 1;

    	{
    	  withSelector.exports = requireWithSelector_production_min();
    	}
    	return withSelector.exports;
    }

    var withSelectorExports = requireWithSelector();
    var useSyncExternalStoreExports = /*@__PURE__*/getDefaultExportFromCjs(withSelectorExports);

    const { useSyncExternalStoreWithSelector } = useSyncExternalStoreExports;
    let didWarnAboutEqualityFn = false;
    function useStore(api, selector = api.getState, equalityFn) {
      if ((undefined ? undefined.MODE : void 0) !== "production" && equalityFn && !didWarnAboutEqualityFn) {
        console.warn(
          "[DEPRECATED] Use `createWithEqualityFn` instead of `create` or use `useStoreWithEqualityFn` instead of `useStore`. They can be imported from 'zustand/traditional'. https://github.com/pmndrs/zustand/discussions/1937"
        );
        didWarnAboutEqualityFn = true;
      }
      const slice = useSyncExternalStoreWithSelector(
        api.subscribe,
        api.getState,
        api.getServerState || api.getState,
        selector,
        equalityFn
      );
      React.useDebugValue(slice);
      return slice;
    }
    const createImpl = (createState) => {
      if ((undefined ? undefined.MODE : void 0) !== "production" && typeof createState !== "function") {
        console.warn(
          "[DEPRECATED] Passing a vanilla store will be unsupported in a future version. Instead use `import { useStore } from 'zustand'`."
        );
      }
      const api = typeof createState === "function" ? createStore(createState) : createState;
      const useBoundStore = (selector, equalityFn) => useStore(api, selector, equalityFn);
      Object.assign(useBoundStore, api);
      return useBoundStore;
    };
    const create = (createState) => createState ? createImpl(createState) : createImpl;

    /**
     * ==================================================
     *   _____ _ _ _             _
     *  |     |_| | |___ ___ ___|_|_ _ _____
     *  | | | | | | | -_|   |   | | | |     |
     *  |_|_|_|_|_|_|___|_|_|_|_|_|___|_|_|_|
     *
     * ==================================================
     *
     * Copyright (c) 2025 Project Digitaldepot
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in all
     * copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     * SOFTWARE.
     */
    const openListeners = new Set();
    const closeListeners = new Set();
    const useQuickAccessStore = create(() => ({
        openQuickAccess: () => {
            openListeners.forEach((cb) => cb());
        },
        closeQuickAccess: () => {
            closeListeners.forEach((cb) => cb());
        },
        subscribeToOpen: (cb) => {
            openListeners.add(cb);
            return () => openListeners.delete(cb);
        },
        subscribeToClose: (cb) => {
            closeListeners.add(cb);
            return () => closeListeners.delete(cb);
        },
    }));

    const MillenniumDesktopSidebar = () => {
        const { isOpen, activePlugin, closeMenu, openMenu, toggleMenu, setActivePlugin } = useDesktopMenu();
        const [openAnimStart, setOpenAnimStartState] = React.useState(false);
        const [closed, setClosed] = React.useState(true);
        const ref = React.useRef(null);
        const closedInterval = React.useRef(null);
        const animFrame = React.useRef(0);
        const browserManagerHook = React.useRef(new BrowserManagerHook());
        const getHostWindow = React.useCallback(() => {
            return client.getParentWindow(ref.current);
        }, []);
        const setAnimStart = React.useCallback((value) => {
            setOpenAnimStartState(value);
        }, []);
        React.useEffect(() => {
            const unsubscribeOpen = useQuickAccessStore.getState().subscribeToOpen(() => {
                openMenu();
                openQuickAccess();
            });
            const unsubscribeClose = useQuickAccessStore.getState().subscribeToClose(() => {
                closeMenu();
                closeQuickAccess();
            });
            return () => {
                unsubscribeOpen();
                unsubscribeClose();
            };
        }, []);
        const closeQuickAccess = React.useCallback(async () => {
            const hostWindow = getHostWindow();
            if (closedInterval.current) {
                clearTimeout(closedInterval.current);
                closedInterval.current = null;
            }
            cancelAnimationFrame(animFrame.current);
            animFrame.current = requestAnimationFrame(() => {
                setAnimStart(false);
            });
            closedInterval.current = setTimeout(() => {
                setClosed(true);
                browserManagerHook.current.setBrowserVisible(hostWindow, true);
                closedInterval.current = null;
                setActivePlugin(undefined);
            }, 300);
            browserManagerHook.current.setShouldBlockRequest(false);
        }, [getHostWindow, setAnimStart]);
        const openQuickAccess = React.useCallback(async () => {
            browserManagerHook.current.setShouldBlockRequest(true);
            const hostWindow = getHostWindow();
            if (closedInterval.current) {
                clearTimeout(closedInterval.current);
                closedInterval.current = null;
            }
            try {
                await browserManagerHook.current.setBrowserVisible(hostWindow, false);
            }
            catch (error) {
                console.error('Error setting browser visibility:', error);
            }
            setClosed(false);
            setTimeout(() => {
                cancelAnimationFrame(animFrame.current);
                animFrame.current = requestAnimationFrame(() => {
                    setAnimStart(true);
                });
            }, 8);
        }, [getHostWindow, setAnimStart]);
        const handleKeyDown = React.useCallback((e) => {
            if (!(e.ctrlKey && e.key === '2')) {
                return;
            }
            e.preventDefault();
            e.stopPropagation();
            toggleMenu();
        }, [toggleMenu, isOpen]);
        const handleSidebarDimClick = React.useCallback(() => {
            closeMenu();
        }, [closeMenu]);
        React.useEffect(() => {
            if (isOpen && closed) {
                openQuickAccess();
            }
            else if (!isOpen && !closed) {
                closeQuickAccess();
            }
        }, [isOpen, closed, openQuickAccess, closeQuickAccess]);
        React.useEffect(() => {
            const hostWindow = getHostWindow();
            hostWindow?.document?.addEventListener?.('keydown', handleKeyDown, true);
            browserManagerHook.current.hook();
            return () => {
                hostWindow?.document?.removeEventListener?.('keydown', handleKeyDown, true);
                if (closedInterval.current) {
                    clearTimeout(closedInterval.current);
                    closedInterval.current = null;
                }
                cancelAnimationFrame(animFrame.current);
                try {
                    browserManagerHook.current.unhook();
                }
                catch (error) {
                    console.error('Error during cleanup:', error);
                }
            };
        }, []);
        return (jsxRuntime.jsxs(client.ErrorBoundary, { children: [jsxRuntime.jsx(Styles, {}), jsxRuntime.jsx(MillenniumDesktopSidebarStyles, { isDesktopMenuOpen: isOpen || !closed, openAnimStart: openAnimStart, isViewingPlugin: !!activePlugin }), jsxRuntime.jsx("div", { className: "MillenniumDesktopSidebar_Overlay", onClick: handleSidebarDimClick }), jsxRuntime.jsxs("div", { className: "MillenniumDesktopSidebar", ref: ref, children: [jsxRuntime.jsx(TitleView, {}), jsxRuntime.jsx("div", { className: "MillenniumDesktopSidebar_Content", children: activePlugin ? jsxRuntime.jsx(RenderPluginView, {}) : jsxRuntime.jsx(PluginSelectorView, {}) })] })] }));
    };

    const WelcomeModalComponent = () => {
        React.useEffect(() => {
            if (settingsManager.config.misc.hasShownWelcomeModal) {
                return;
            }
            else {
                settingsManager.config.misc.hasShownWelcomeModal = true;
                settingsManager.forceSaveConfig();
            }
            let welcomeModalWindow;
            const WelcomeModal = () => {
                return (jsxRuntime.jsx(client.ConfirmModal, { strTitle: locale.strWelcomeModalTitle, strDescription: jsxRuntime.jsx(Markdown, { options: { overrides: { a: { props: { target: '_blank' } } } }, children: locale.strWelcomeModalDescription }), strOKButtonText: locale.strWelcomeModalOKButton, bAlertDialog: true, bDisableBackgroundDismiss: true, bHideCloseIcon: true, onOK: () => {
                        welcomeModalWindow?.Close();
                    } }));
            };
            welcomeModalWindow = client.showModal(jsxRuntime.jsx(WelcomeModal, {}), window.PLUGIN_LIST[pluginName].mainWindow, {
                popupHeight: 475,
                popupWidth: 625,
            });
        }, []);
        return null;
    };

    async function initializeMillennium(settings) {
        Logger.Log(`Received props`, settings);
        const theme = settings.active_theme;
        const systemColors = settings.accent_color;
        ParseLocalTheme(theme);
        DispatchSystemColors(systemColors);
        const themeV1 = settings?.active_theme?.data;
        if (themeV1?.GlobalsColors) {
            DispatchGlobalColors(themeV1?.GlobalsColors);
        }
        if (theme?.data?.hasOwnProperty('RootColors')) {
            const rootColors = await PyGetRootColors();
            Logger.Log('RootColors found in theme, dispatching...', rootColors);
            window.PLUGIN_LIST[pluginName].RootColors = rootColors;
        }
        Object.assign(window.PLUGIN_LIST[pluginName], {
            accentColor: settings?.accent_color,
            conditionals: settings?.conditions,
            steamPath: settings?.steamPath,
            installPath: settings?.installPath,
            version: settings?.millenniumVersion,
            enabledPlugins: settings?.enabledPlugins ?? [],
            updates: settings?.updates ?? [],
            hasCheckedForUpdates: settings?.hasCheckedForUpdates ?? false,
            buildDate: settings?.buildDate,
            millenniumUpdates: settings?.millenniumUpdates ?? {},
            platformType: settings?.platformType,
            millenniumLinuxUpdateScript: settings?.millenniumLinuxUpdateScript,
        });
        patchMissedDocuments();
        const notificationService = new NotificationService();
        notificationService.showNotifications();
    }
    // Entry point on the front end of your plugin
    async function PluginMain() {
        await initializeMillennium(JSON.parse(await PyGetStartupConfig()));
        client.Millennium.AddWindowCreateHook(onWindowCreatedCallback);
        client.routerHook.addRoute('/millennium/settings', () => jsxRuntime.jsx(MillenniumSettings, {}), { exact: false });
        client.routerHook.addGlobalComponent('MillenniumDesktopUI', () => (jsxRuntime.jsx(DesktopMenuProvider, { children: jsxRuntime.jsx(MillenniumDesktopSidebar, {}) })), client.EUIMode.Desktop);
        /** Render welcome modal for new users */
        client.routerHook.addGlobalComponent('MillenniumWelcomeModal', () => jsxRuntime.jsx(WelcomeModalComponent, {}), client.EUIMode.Desktop);
        // @ts-ignore
        SteamClient.URL.RegisterForRunSteamURL('millennium', OnRunSteamURL);
    }

    exports.default = PluginMain;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

})({}, SP_JSX_FACTORY, window.MILLENNIUM_API, window.SP_REACT);
 return millennium_main; };
function ExecutePluginModule() {
    let MillenniumStore = window.MILLENNIUM_PLUGIN_SETTINGS_STORE[pluginName];
    function OnPluginConfigChange(key, __, value) {
        if (key in MillenniumStore.settingsStore) {
            MillenniumStore.ignoreProxyFlag = true;
            MillenniumStore.settingsStore[key] = value;
            MillenniumStore.ignoreProxyFlag = false;
        }
    }
    /** Expose the OnPluginConfigChange so it can be called externally */
    MillenniumStore.OnPluginConfigChange = OnPluginConfigChange;
    MILLENNIUM_BACKEND_IPC.postMessage(0, { pluginName: pluginName, methodName: '__builtins__.__millennium_plugin_settings_parser__' }).then(async (response) => {
        /**
         * __millennium_plugin_settings_parser__ will return false if the plugin has no settings.
         * If the plugin has settings, it will return a base64 encoded string.
         * The string is then decoded and parsed into an object.
         */
        if (typeof response.returnValue === 'string') {
            MillenniumStore.ignoreProxyFlag = true;
            /** Initialize the settings store from the settings returned from the backend. */
            MillenniumStore.settingsStore = MillenniumStore.DefinePluginSetting(Object.fromEntries(JSON.parse(atob(response.returnValue)).map((item) => [item.functionName, item])));
            MillenniumStore.ignoreProxyFlag = false;
        }
        /** @ts-ignore: call the plugin main after the settings have been parsed. This prevent plugin settings from being undefined at top level. */
        let PluginModule = PluginEntryPointMain();
        /** Assign the plugin on plugin list. */
        Object.assign(window.PLUGIN_LIST[pluginName], {
            ...PluginModule,
            __millennium_internal_plugin_name_do_not_use_or_change__: pluginName,
        });
        /** Run the rolled up plugins default exported function */
        let pluginProps = await PluginModule.default();
        function isValidSidebarNavComponent(obj) {
            return obj && obj.title !== undefined && obj.icon !== undefined && obj.content !== undefined;
        }
        if (pluginProps && isValidSidebarNavComponent(pluginProps)) {
            window.MILLENNIUM_SIDEBAR_NAVIGATION_PANELS[pluginName] = pluginProps;
        }
        else {
            console.warn(`Plugin ${pluginName} does not contain proper SidebarNavigation props and therefor can't be mounted by Millennium. Please ensure it has a title, icon, and content.`);
            return;
        }
        /** If the current module is a client module, post message id=1 which calls the front_end_loaded method on the backend. */
        if (MILLENNIUM_IS_CLIENT_MODULE) {
            MILLENNIUM_BACKEND_IPC.postMessage(1, { pluginName: pluginName });
        }
    });
}
ExecutePluginModule()