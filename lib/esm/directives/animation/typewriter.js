import { DirectiveHandlerReturn } from '../../typedefs';
import { IntersectionObserver } from '../../observers/intersection';
import { Region } from '../../region';
import { ExtendedDirectiveHandler } from '../extended/generic';
export class TypewriterDirectiveHandler extends ExtendedDirectiveHandler {
    constructor() {
        super('typewriter', (region, element, directive) => {
            let response = ExtendedDirectiveHandler.CheckEvents(this.key_, region, element, directive, 'load', ['error']);
            if (response != DirectiveHandlerReturn.Nil) {
                return response;
            }
            let data = ExtendedDirectiveHandler.Evaluate(region, element, directive.value), state = {
                lines: new Array(),
                currentLineIndex: -1,
                currentColumnIndex: -1,
                iterations: 0,
                deleting: false,
                complete: false,
                active: true,
            };
            let length = 0;
            let addStringLine = (line) => {
                state.lines.push({
                    blocks: [line],
                    length: line.length,
                });
                length += line.length;
            };
            if (Array.isArray(data)) {
                data.forEach((entry) => {
                    if (Array.isArray(entry)) { //Collection of blocks
                        let line = {
                            blocks: [],
                            length: 0,
                        };
                        entry.forEach((block) => {
                            let formattedBlock;
                            if (typeof block === 'string') { //Block is raw string
                                formattedBlock = {
                                    text: block,
                                };
                            }
                            else { //Block is formatted
                                formattedBlock = block;
                            }
                            line.blocks.push(formattedBlock);
                            line.length += (formattedBlock.contiguous ? 1 : formattedBlock.text.length);
                            length += (formattedBlock.contiguous ? 1 : formattedBlock.text.length);
                        });
                        state.lines.push(line);
                    }
                    else if (typeof entry !== 'string') { //Line is a single block
                        state.lines.push({
                            blocks: [entry],
                            length: entry.text.length,
                        });
                        length += entry.text.length;
                    }
                    else { //Line is a raw string
                        addStringLine(entry);
                    }
                });
            }
            else if (typeof data === 'string') {
                addStringLine(data);
            }
            if (length == 0) {
                region.GetState().ReportError('\'x-typewriter\' reguires one or more blocks to display', element);
                return DirectiveHandlerReturn.Handled;
            }
            let options = {
                delay: 100,
                interval: 250,
                deleteDelay: 100,
                iterations: -1,
                ancestor: -1,
                delete: false,
                random: false,
                cursor: false,
                lazy: false,
            };
            let timeOptions = {
                delay: 100,
                interval: 250,
            };
            directive.arg.options.forEach((option, index) => {
                if (!(option in options)) {
                    return;
                }
                if (option === 'ancestor') {
                    if ((index + 1) < directive.arg.options.length) {
                        options.ancestor = (parseInt(directive.arg.options[index + 1]) || 0);
                    }
                    else { //Use parent
                        options.ancestor = 0;
                    }
                }
                else if (typeof options[option] === 'number' && (index + 1) < directive.arg.options.length) {
                    if (option in timeOptions) {
                        options[option] = ExtendedDirectiveHandler.ExtractDuration(directive.arg.options[index + 1], timeOptions[option]);
                    }
                    else {
                        options[option] = (parseInt(directive.arg.options[index + 1]) || -1);
                    }
                }
                else if (typeof options[option] === 'boolean') {
                    options[option] = true;
                    if (option === 'delete') {
                        options.deleteDelay = ExtendedDirectiveHandler.ExtractDuration(directive.arg.options[index + 1], 100);
                    }
                }
            });
            let getRange = (line, length) => {
                let value = '';
                for (let i = 0; i < line.blocks.length && 0 < length; ++i) {
                    if (typeof line.blocks[i] !== 'string') {
                        let attributes = '';
                        Object.entries(line.blocks[i].attributes || {}).forEach(([key, value]) => {
                            attributes += ` ${key}="${value}"`;
                        });
                        let tagName = (line.blocks[i].tagName || 'span');
                        if (line.blocks[i].contiguous) {
                            value += `<${tagName}${attributes}>${line.blocks[i].text}</${tagName}>`;
                            length -= 1;
                        }
                        else { //Block text is a collection
                            value += `<${tagName}${attributes}>${line.blocks[i].text.substr(0, length)}</${tagName}>`;
                            length -= line.blocks[i].text.length;
                        }
                    }
                    else { //Content is raw string
                        value += line.blocks[i].substr(0, length);
                        length -= line.blocks[i].length;
                    }
                }
                return value;
            };
            let getNextIndex = (index) => {
                index = (options.random ? Math.floor(Math.random() * state.lines.length) : (index + 1));
                return ((index < state.lines.length) ? index : 0);
            };
            let initNext = () => {
                state.currentLineIndex = getNextIndex(state.currentLineIndex);
                state.currentColumnIndex = 0;
            };
            let startTimestamp = null, duration = options.delay, regionId = region.GetId();
            let pass = (timestamp) => {
                if (startTimestamp === null) {
                    startTimestamp = timestamp;
                }
                if ((timestamp - startTimestamp) < duration) { //Duration not met
                    requestAnimationFrame(pass);
                    return;
                }
                if (!state.complete) {
                    startTimestamp = timestamp;
                    let value;
                    if (state.deleting) { //Remove characters
                        if (state.lines[state.currentLineIndex].length < state.currentColumnIndex) {
                            duration = options.delay;
                        }
                        value = getRange(state.lines[state.currentLineIndex], --state.currentColumnIndex);
                        if (state.currentColumnIndex <= 0) { //Done delete
                            startTimestamp = null;
                            state.deleting = false;
                            state.complete = true;
                            duration = options.interval;
                        }
                    }
                    else { //Add characters
                        value = getRange(state.lines[state.currentLineIndex], ++state.currentColumnIndex);
                        if (state.lines[state.currentLineIndex].length < state.currentColumnIndex && options.delete) { //Begin delete
                            startTimestamp = null;
                            state.deleting = true;
                            duration = options.deleteDelay;
                        }
                        else if (state.lines[state.currentLineIndex].length < state.currentColumnIndex) {
                            startTimestamp = null;
                            state.complete = true;
                            duration = options.interval;
                        }
                    }
                    Region.InsertHtml(element, value, true, false, Region.Get(regionId));
                    requestAnimationFrame(pass);
                }
                else if (options.iterations == -1 || (++state.iterations < options.iterations)) { //Request next line
                    startTimestamp = null;
                    state.complete = false;
                    duration = options.delay;
                    initNext();
                    requestAnimationFrame(pass);
                }
            };
            if (options.lazy) {
                let intersectionOptions = {
                    root: ((options.ancestor == -1) ? null : region.GetElementAncestor(element, options.ancestor)),
                };
                region.GetIntersectionObserverManager().Add(element, IntersectionObserver.BuildOptions(intersectionOptions)).Start((entry, key) => {
                    initNext();
                    requestAnimationFrame(pass);
                    let myRegion = Region.Get(regionId);
                    if (myRegion) {
                        region.GetIntersectionObserverManager().RemoveByKey(key);
                    }
                });
            }
            else { //Immediate initialization
                initNext();
                requestAnimationFrame(pass);
            }
            region.AddElement(element).uninitCallbacks.push(() => {
                state.active = true;
            });
            return DirectiveHandlerReturn.Handled;
        });
    }
}
