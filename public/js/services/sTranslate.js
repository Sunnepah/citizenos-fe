'use strict';

angular
    .module('citizenos')
    .service('sTranslate', ['$state', '$translate', '$log', '$filter', '$cookies', 'cosConfig', function ($state, $translate, $log, $filter, $cookies, cosConfig) {
        var sTranslate = this;

        sTranslate.LANGUAGES = Object.keys(cosConfig.language.list);
        sTranslate.currentLanguage = cosConfig.language.default;
        var debugLang = cosConfig.language.debug;

        var init = function () {
            var clientLang = $translate.resolveClientLocale();
            if ($cookies.get('language')) {
                clientLang = $cookies.get('language');
            }
            if (sTranslate.LANGUAGES.indexOf(clientLang) > -1) {
                sTranslate.currentLanguage = clientLang;
            }
        };
        init();

        sTranslate.setLanguage = function (language) {
            $log.debug('sTranslate', 'setLanguage', language);
            if (sTranslate.checkLanguageIsValid(language) && $translate.use() !== language) {
                $log.debug('setLanguage', language);
                sTranslate.currentLanguage = language;
                return $translate.use(language);
            }
            return $translate.use();
        };

        sTranslate.switchLanguage = function (language) {
            $log.debug('switch language', language);
            if (sTranslate.checkLanguageIsValid(language)) {
                $state.transitionTo($state.current.name, {language: language});
            }
            sTranslate.setLanguage(language);
        };

        sTranslate.debugMode = function () {
            if ($translate.use() !== debugLang) {
                $translate.use(debugLang);
            } else {
                $translate.use(sTranslate.currentLanguage);
            }
        };

        sTranslate.checkLanguageIsValid = function (language) {
            if (language === debugLang) {
                return false;
            }
            return sTranslate.LANGUAGES.indexOf(language) !== -1;
        };

    }]);
