import { _coreExports } from './base';

export function forExpress() {
    return {
        createDokieHandler: _coreExports.createDokieHandler,
        createDokieMiddleware: _coreExports.createDokieHandler,
        getDokieAssetPath: _coreExports.getDokieAssetPath,
        registerDokieRoute: _coreExports.registerDokieRoute,
        renderDokieHtml: _coreExports.renderDokieHtml,
    };
}
