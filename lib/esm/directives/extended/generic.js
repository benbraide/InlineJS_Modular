import { DirectiveHandler } from '../generic';
export class ExtendedDirectiveHandler extends DirectiveHandler {
    constructor(key, handler) {
        super(key, handler, false);
    }
    GenerateScopeId_(region) {
        return region.GenerateDirectiveScopeId(null, `_${this.key_}`);
    }
}
