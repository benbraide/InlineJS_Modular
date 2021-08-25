import { Region } from './region'
import { Bootstrap } from './bootstrap'

import { DataDirectiveHandler, LocalsDirectiveHandler, ComponentDirectiveHandler, RefDirectiveHandler } from './directives/data'
import { InitDirectiveHandler, UninitDirectiveHandler, PostDirectiveHandler, BindDirectiveHandler, StaticDirectiveHandler } from './directives/lifecycle'
import { TextDirectiveHandler, HtmlDirectiveHandler } from './directives/text'
import { AttrDirectiveHandler, StyleDirectiveHandler, ClassDirectiveHandler } from './directives/attr'
import { CloakDirectiveHandler } from './directives/cloak'
import { ShowDirectiveHandler } from './directives/show'
import { ModelDirectiveHandler } from './directives/model'
import { OnDirectiveHandler } from './directives/on'
import { IfDirectiveHandler } from './directives/if'
import { EachDirectiveHandler } from './directives/each'

import {
    NextTickGlobalHandler,
    PostGlobalHandler,
    UseGlobalHandler,
    StaticGlobalHandler,
    RawGlobalHandler,
    OrGlobalHandler,
    AndGlobalHandler,
    ConditionalGlobalHandler,
    EvaluateGlobalHandler,
    CallTempGlobalHandler
} from './globals/meta'
import { ComponentKeyGlobalHandler, ComponentGlobalHandler, LocalsGlobalHandler, GetScopeGlobalHandler } from './globals/component'
import { ProxyGlobalHandler, RefsGlobalHandler, RootGlobalHandler } from './globals/proxy'
import { ParentGlobalHandler, AncestorGlobalHandler, SiblingGlobalHandler, FormGlobalHandler } from './globals/dom'
import { ClassGlobalHandler } from './globals/class'
import { WindowGlobalHandler, DocumentGlobalHandler, BodyGlobalHandler, ConsoleGlobalHandler, WindowAlertGlobalHandler } from './globals/window'
import { ExpandEventGlobalHandler, DispatchEventGlobalHandler } from './globals/event'
import { WatchGlobalHandler, WhenGlobalHandler, OnceGlobalHandler } from './globals/watch'

Region.GetDirectiveManager().AddHandler(new DataDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new LocalsDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new ComponentDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new RefDirectiveHandler());

Region.GetDirectiveManager().AddHandler(new InitDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new UninitDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new PostDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new BindDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new StaticDirectiveHandler());

Region.GetDirectiveManager().AddHandler(new TextDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new HtmlDirectiveHandler());

Region.GetDirectiveManager().AddHandler(new AttrDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new StyleDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new ClassDirectiveHandler());

Region.GetDirectiveManager().AddHandler(new CloakDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new ShowDirectiveHandler());

Region.GetDirectiveManager().AddHandler(new ModelDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new OnDirectiveHandler());

Region.GetDirectiveManager().AddHandler(new IfDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new EachDirectiveHandler());

Region.GetGlobalManager().AddHandler(new NextTickGlobalHandler());
Region.GetGlobalManager().AddHandler(new PostGlobalHandler());
Region.GetGlobalManager().AddHandler(new UseGlobalHandler());
Region.GetGlobalManager().AddHandler(new StaticGlobalHandler());
Region.GetGlobalManager().AddHandler(new RawGlobalHandler());
Region.GetGlobalManager().AddHandler(new OrGlobalHandler());
Region.GetGlobalManager().AddHandler(new AndGlobalHandler());
Region.GetGlobalManager().AddHandler(new ConditionalGlobalHandler());
Region.GetGlobalManager().AddHandler(new EvaluateGlobalHandler());
Region.GetGlobalManager().AddHandler(new CallTempGlobalHandler());

Region.GetGlobalManager().AddHandler(new ComponentKeyGlobalHandler());
Region.GetGlobalManager().AddHandler(new ComponentGlobalHandler());
Region.GetGlobalManager().AddHandler(new LocalsGlobalHandler());
Region.GetGlobalManager().AddHandler(new GetScopeGlobalHandler());

Region.GetGlobalManager().AddHandler(new ProxyGlobalHandler());
Region.GetGlobalManager().AddHandler(new RefsGlobalHandler());
Region.GetGlobalManager().AddHandler(new RootGlobalHandler());

Region.GetGlobalManager().AddHandler(new ParentGlobalHandler());
Region.GetGlobalManager().AddHandler(new AncestorGlobalHandler());
Region.GetGlobalManager().AddHandler(new SiblingGlobalHandler());
Region.GetGlobalManager().AddHandler(new FormGlobalHandler());

Region.GetGlobalManager().AddHandler(new ClassGlobalHandler());

Region.GetGlobalManager().AddHandler(new WindowGlobalHandler());
Region.GetGlobalManager().AddHandler(new DocumentGlobalHandler());
Region.GetGlobalManager().AddHandler(new BodyGlobalHandler());
Region.GetGlobalManager().AddHandler(new ConsoleGlobalHandler());
Region.GetGlobalManager().AddHandler(new WindowAlertGlobalHandler());

Region.GetGlobalManager().AddHandler(new ExpandEventGlobalHandler());
Region.GetGlobalManager().AddHandler(new DispatchEventGlobalHandler());

Region.GetGlobalManager().AddHandler(new WatchGlobalHandler());
Region.GetGlobalManager().AddHandler(new WhenGlobalHandler());
Region.GetGlobalManager().AddHandler(new OnceGlobalHandler());

window['InlineJS'] = {
    Region: Region,
    Bootstrap: new Bootstrap(),
};
