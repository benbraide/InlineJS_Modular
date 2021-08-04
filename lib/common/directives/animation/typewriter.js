"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypewriterDirectiveHandler = void 0;
const typedefs_1 = require("../../typedefs");
const intersection_1 = require("../../observers/intersection");
const region_1 = require("../../region");
const generic_1 = require("../extended/generic");
class TypewriterDirectiveHandler extends generic_1.ExtendedDirectiveHandler {
    constructor() {
        super('typewriter', (region, element, directive) => {
            let response = generic_1.ExtendedDirectiveHandler.CheckEvents(this.key_, region, element, directive, 'load', ['error']);
            if (response != typedefs_1.DirectiveHandlerReturn.Nil) {
                return response;
            }
            let data = generic_1.ExtendedDirectiveHandler.Evaluate(region, element, directive.value), state = {
                lines: new Array(),
                current: {
                    lineIndex: -1,
                    block: null,
                },
                iterations: 0,
                deleting: false,
                complete: false,
                active: true,
            };
            let buildBlockEntry = (content, index) => {
                let blockElement;
                if (typeof content !== 'string') {
                    blockElement = document.createElement(content.tagName || 'span');
                    Object.entries(content.attributes || {}).forEach(([key, value]) => blockElement.setAttribute(key, value));
                }
                else {
                    blockElement = document.createElement('span');
                }
                let cursor = document.createElement('span');
                cursor.style.borderRight = '1px solid #333333';
                blockElement.appendChild(cursor);
                return {
                    content: content,
                    element: blockElement,
                    cursor: cursor,
                    index: index,
                };
            };
            let length = 0;
            let addStringLine = (line) => {
                state.lines.push({
                    blocks: [buildBlockEntry(line, 0)],
                    length: line.length,
                });
                length += line.length;
            };
            if (Array.isArray(data)) {
                data.forEach((item) => {
                    if (Array.isArray(item)) { //Collection of blocks
                        let line = {
                            blocks: [],
                            length: 0,
                        };
                        item.forEach((block) => {
                            let formattedBlock;
                            if (typeof block === 'string') { //Block is raw string
                                formattedBlock = {
                                    text: block,
                                };
                            }
                            else { //Block is formatted
                                formattedBlock = block;
                            }
                            line.blocks.push(buildBlockEntry(formattedBlock, line.blocks.length));
                            line.length += formattedBlock.text.length;
                            length += formattedBlock.text.length;
                        });
                        state.lines.push(line);
                    }
                    else if (typeof item !== 'string') { //Line is a single block
                        state.lines.push({
                            blocks: [buildBlockEntry(item, 0)],
                            length: item.text.length,
                        });
                        length += item.text.length;
                    }
                    else { //Line is a raw string
                        addStringLine(item);
                    }
                });
            }
            else if (typeof data === 'string') {
                addStringLine(data);
            }
            if (length == 0) {
                region.GetState().ReportError('\'x-typewriter\' reguires one or more blocks to display', element);
                return typedefs_1.DirectiveHandlerReturn.Handled;
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
                        options[option] = generic_1.ExtendedDirectiveHandler.ExtractDuration(directive.arg.options[index + 1], timeOptions[option]);
                    }
                    else {
                        options[option] = (parseInt(directive.arg.options[index + 1]) || -1);
                    }
                }
                else if (typeof options[option] === 'boolean') {
                    options[option] = true;
                    if (option === 'delete') {
                        options.deleteDelay = generic_1.ExtendedDirectiveHandler.ExtractDuration(directive.arg.options[index + 1], 100);
                    }
                }
            });
            let initBlock = (block) => {
                if (options.cursor) {
                    block.cursor.style.display = 'inline';
                }
                element.appendChild(block.element);
            };
            let uninitBlock = (block) => {
                if (!block) {
                    return;
                }
                element.removeChild(block.element);
                if (options.cursor) {
                    block.cursor.style.display = 'none';
                }
            };
            let getPreviousBlock = (line, block) => {
                if (block === null) {
                    return line.blocks[(line.blocks.length - 1)];
                }
                if (options.cursor && typeof block !== 'number') {
                    uninitBlock(block);
                }
                let nextIndex = (((typeof block === 'number') ? block : block.index) - 1);
                return ((0 <= nextIndex) ? line.blocks[nextIndex] : null);
            };
            let getNextBlock = (line, block) => {
                if (block === null) {
                    return line.blocks[0];
                }
                if (options.cursor && typeof block !== 'number') {
                    block.cursor.style.display = 'none';
                }
                let nextIndex = (((typeof block === 'number') ? block : block.index) + 1);
                return ((nextIndex < line.blocks.length) ? line.blocks[nextIndex] : null);
            };
            let getAdvancedBlock = (line, block, isDeleting) => {
                return (isDeleting ? getPreviousBlock(line, block) : getNextBlock(line, block));
            };
            let decrementBlock = (block) => {
                if (!block) {
                    return false;
                }
                block.element.removeChild(block.cursor);
                let currentLength = block.element.textContent.length, contentLength = ((typeof block.content === 'string') ? block.content.length : block.content.text.length);
                if (currentLength == 0) {
                    block.element.appendChild(block.cursor);
                    return false; //Reached end
                }
                if (typeof block.content !== 'string') {
                    if (block.content.contiguous) {
                        block.element.textContent = '';
                    }
                    else { //Extract required
                        block.element.textContent = ((currentLength == 1) ? '' : block.content.text.substr(0, (currentLength - 1)));
                    }
                }
                else { //Raw string
                    block.element.textContent = ((currentLength == 1) ? '' : block.content.substr(0, (currentLength - 1)));
                }
                if (currentLength == contentLength) { //Init
                    initBlock(block);
                }
                block.element.appendChild(block.cursor);
                return true;
            };
            let incrementBlock = (block) => {
                if (!block) {
                    return false;
                }
                block.element.removeChild(block.cursor);
                let currentLength = block.element.textContent.length;
                if (currentLength == ((typeof block.content === 'string') ? block.content.length : block.content.text.length)) {
                    block.element.appendChild(block.cursor);
                    return false; //Reached end
                }
                if (typeof block.content !== 'string') {
                    if (block.content.contiguous) {
                        block.element.textContent = block.content.text;
                    }
                    else { //Extract required
                        block.element.textContent = block.content.text.substr(0, (currentLength + 1));
                    }
                }
                else { //Raw string
                    block.element.textContent = block.content.substr(0, (currentLength + 1));
                }
                if (currentLength == 0) { //Init
                    initBlock(block);
                }
                block.element.appendChild(block.cursor);
                return true;
            };
            let advanceBlock = (block, isDeleting) => {
                return (isDeleting ? decrementBlock(block) : incrementBlock(block));
            };
            let getNextLineIndex = (index) => {
                if (index != -1 && index < state.lines.length && !options.delete) {
                    state.lines[index].blocks.forEach((block) => {
                        block.element.removeChild(block.cursor);
                        block.element.textContent = '';
                        block.element.appendChild(block.cursor);
                    });
                }
                let newIndex = (options.random ? Math.floor(Math.random() * state.lines.length) : (index + 1));
                return ((newIndex < state.lines.length) ? newIndex : 0);
            };
            let startTimestamp = null, duration = options.delay, regionId = region.GetId();
            let pass = (timestamp) => {
                if (!state.active) {
                    return;
                }
                if (startTimestamp === null) {
                    startTimestamp = timestamp;
                }
                if ((timestamp - startTimestamp) < duration) { //Duration not met
                    requestAnimationFrame(pass);
                    return;
                }
                if (!state.complete) {
                    startTimestamp = timestamp;
                    if (!advanceBlock(state.current.block, state.deleting)) {
                        state.current.block = getAdvancedBlock(state.lines[state.current.lineIndex], state.current.block, state.deleting);
                        if (!state.current.block) { //Complete
                            startTimestamp = null;
                            if (options.delete && !state.deleting) { //Begin delete
                                state.deleting = true;
                                state.complete = false;
                                duration = options.deleteDelay;
                            }
                            else { //Complete
                                state.deleting = false;
                                state.complete = true;
                                duration = options.interval;
                            }
                        }
                        else { //Advance
                            advanceBlock(state.current.block, state.deleting);
                        }
                    }
                }
                else { //Request next line
                    startTimestamp = null;
                    state.complete = false;
                    duration = options.delay;
                    state.current.lineIndex = getNextLineIndex(state.current.lineIndex);
                    if (options.iterations != -1 && (options.iterations <= ++state.iterations)) {
                        return;
                    }
                }
                requestAnimationFrame(pass);
            };
            state.current.lineIndex = getNextLineIndex(-1);
            if (options.lazy) {
                let intersectionOptions = {
                    root: ((options.ancestor == -1) ? null : region.GetElementAncestor(element, options.ancestor)),
                };
                region.GetIntersectionObserverManager().Add(element, intersection_1.IntersectionObserver.BuildOptions(intersectionOptions)).Start((entry, key) => {
                    requestAnimationFrame(pass);
                    let myRegion = region_1.Region.Get(regionId);
                    if (myRegion) {
                        myRegion.GetIntersectionObserverManager().RemoveByKey(key);
                    }
                });
            }
            else { //Immediate initialization
                requestAnimationFrame(pass);
            }
            region.AddElement(element).uninitCallbacks.push(() => {
                state.active = true;
            });
            return typedefs_1.DirectiveHandlerReturn.Handled;
        });
    }
}
exports.TypewriterDirectiveHandler = TypewriterDirectiveHandler;
