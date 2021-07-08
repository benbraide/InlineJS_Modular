require('./inlinejs')

import { Region } from './region'
import { SwalAlertHandler } from './alerts/swal'

import { WatchDirectiveHandler, WhenDirectiveHandler, OnceDirectiveHandler } from './directives/extended/watch'
import { ImageDirectiveHandler } from './directives/extended/image'
import { XHRDirectiveHandler, JSONDirectiveHandler } from './directives/extended/xhr'
import { TypewriterDirectiveHandler } from './directives/animation/typewriter'

import { MouseGlobalHandler } from './globals/mouse'
import { AlertGlobalHandler } from './globals/alert'
import { KeyboardGlobalHandler } from './globals/keyboard'
import { ScreenGlobalHandler } from './globals/screen'
import { OverlayGlobalHandler } from './globals/overlay'
import { ThemeGlobalHandler } from './globals/theme'
import { PageGlobalHandler } from './globals/page'
import { RouterGlobalHandler } from './globals/router'

Region.SetAlertHandler(new SwalAlertHandler());

Region.GetDirectiveManager().AddHandler(new WatchDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new WhenDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new OnceDirectiveHandler());

Region.GetDirectiveManager().AddHandler(new ImageDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new XHRDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new JSONDirectiveHandler());

Region.GetDirectiveManager().AddHandler(new TypewriterDirectiveHandler());

Region.GetGlobalManager().AddHandler(new AlertGlobalHandler());

Region.GetGlobalManager().AddHandler(new MouseGlobalHandler());
Region.GetGlobalManager().AddHandler(new KeyboardGlobalHandler());
Region.GetGlobalManager().AddHandler(new ScreenGlobalHandler());

Region.GetGlobalManager().AddHandler(new OverlayGlobalHandler(true));
Region.GetGlobalManager().AddHandler(new ThemeGlobalHandler());

const routerGlobal = new RouterGlobalHandler();

Region.GetGlobalManager().AddHandler(new PageGlobalHandler(routerGlobal));
Region.GetGlobalManager().AddHandler(routerGlobal);
