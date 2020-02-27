import React, { useCallback, useMemo, useReducer } from 'react';
import { IntlProvider } from 'react-intl';
import { createUseStyles, ThemeProvider } from 'react-jss';

import { buildTheme } from '../utils/styles/theme/theme';
import { Banner } from './banner/banner';
import { Cards } from './cards/cards';

import { styles } from './profile_styles';

import en from '../i18n/en.json';
import fr from '../i18n/fr.json';

import '../styles/lib/slick-carousel/slick-theme.css';
import '../styles/lib/slick-carousel/slick.css';
import { technologiesInitialState, technologiesReducer } from '../store/technologies/technologies_reducer';
import { DeveloperProfileContext } from '../utils/context/contexts';

if (!Intl.PluralRules) {
    // eslint-disable-next-line global-require
    require('@formatjs/intl-pluralrules/polyfill');
    // eslint-disable-next-line global-require
    require('@formatjs/intl-pluralrules/dist/locale-data/en');
    // eslint-disable-next-line global-require
    require('@formatjs/intl-pluralrules/dist/locale-data/fr');
}

const messages = {
    en,
    fr
};
const useStyles = createUseStyles(styles);

const DEFAULT_OPTIONS = Object.freeze({
    locale: 'en',
    customization: {}
});

const DEFAULT_OBJECT = {};
const DEFAULT_FUNCTION = () => {};

const DeveloperProfileComponent = ({
    data = DEFAULT_OBJECT,
    options = DEFAULT_OBJECT,
    mode,
    onEdit: onEditProps = DEFAULT_FUNCTION,
    onCustomizationChanged,
    isEditing = false,
    onFilesUpload = async () => 'https://source.unsplash.com/random/4000x2000',
    BeforeCards,
    additionalNodes,
    classes: receivedGlobalClasses = {}
}) => {
    const { apiKeys, endpoints } = options;
    const classes = useStyles(styles);

    const onEdit = useCallback(newData => {
        if (typeof onEditProps === 'function') {
            onEditProps(newData);
        }
    }, []);
    const store = {
        technologies: useReducer(technologiesReducer, technologiesInitialState)
    };
    const context = useMemo(
        () => ({
            data,
            isEditing,
            onEdit,
            onCustomizationChanged,
            onFilesUpload,
            apiKeys: { giphy: apiKeys?.giphy, unsplash: apiKeys?.unsplash },
            store,
            mode,
            additionalNodes,
            endpoints,
            receivedGlobalClasses
        }),
        [endpoints, apiKeys, data, onEdit, store, mode]
    );

    console.log({ context });

    return (
        <div className={classes.container}>
            <DeveloperProfileContext.Provider value={context}>
                <Banner customizationOptions={options.customization} onCustomizationChanged={onCustomizationChanged} />
                {BeforeCards}
                <Cards cardsOrder={options.customization?.cardsOrder} />
            </DeveloperProfileContext.Provider>
        </div>
    );
};

const WithProvidersDeveloperProfile = ({
    data,
    onEdit,
    onCustomizationChanged,
    options = {},
    mode = 'readOnly',
    additionalNodes,
    BeforeCards,
    classes,
    isEditing
}) => {
    const { locale, customization } = useMemo(() => ({ ...DEFAULT_OPTIONS, ...options }), [options]);
    const builtTheme = useMemo(() => {
        console.time('theme');
        const theme = buildTheme(customization?.theme);
        console.timeEnd('theme');
        return theme;
    }, [customization?.theme]);

    return (
        <ThemeProvider theme={builtTheme}>
            <IntlProvider locale={locale} messages={messages[locale] || messages.en} defaultLocale={locale}>
                <DeveloperProfileComponent
                    isEditing={isEditing}
                    data={data}
                    mode={mode}
                    onEdit={onEdit}
                    onCustomizationChanged={onCustomizationChanged}
                    options={options}
                    additionalNodes={additionalNodes}
                    BeforeCards={BeforeCards}
                    classes={classes}
                />
            </IntlProvider>
        </ThemeProvider>
    );
};

export const DeveloperProfile = WithProvidersDeveloperProfile;
