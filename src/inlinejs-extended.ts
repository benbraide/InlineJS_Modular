require('./inlinejs')

import { Region } from './region'
import { SwalAlertHandler } from './alerts/swal'

import { WatchDirectiveHandler, WhenDirectiveHandler, OnceDirectiveHandler } from './directives/extended/watch'
import { ImageDirectiveHandler } from './directives/extended/image'
import { IntersectionDirectiveHandler } from './directives/extended/intersection'
import { XHRDirectiveHandler, JSONDirectiveHandler } from './directives/extended/xhr'
import { FormDirectiveHandler } from './directives/extended/form'
import { ChangeDirectiveHandler } from './directives/extended/change'
import { StateDirectiveHandler } from './directives/extended/state'
import { CounterDirectiveHandler } from './directives/extended/counter'
import { CodeGlobalHandler } from './directives/extended/code'

import { ChannelDirectiveHandler } from './directives/extended/channel'
import { QuillDirectiveHandler } from './directives/extended/quill'
import { StripeDirectiveHandler } from './directives/extended/stripe'

import { AlertGlobalHandler } from './globals/alert'
import { MouseGlobalHandler } from './globals/mouse'
import { KeyboardGlobalHandler } from './globals/keyboard'
import { ScreenGlobalHandler } from './globals/screen'
import { OverlayGlobalHandler } from './globals/overlay'
import { ModalGlobalHandler } from './globals/modal'
import { ThemeGlobalHandler } from './globals/theme'
import { PageGlobalHandler } from './globals/page'
import { RouterGlobalHandler } from './globals/router'
import { AuthGlobalHandler } from './globals/auth'
import { CartGlobalHandler } from './globals/cart'
import { FavoritesGlobalHandler } from './globals/favorites'
import { ResourceGlobalHandler } from './globals/resource'
import { GeolocationGlobalHandler } from './globals/geolocation'
import { TimeagoGlobalHandler } from './globals/timeago'
import { EchoGlobalHandler } from './globals/echo'
import { NotificationsGlobalHandler } from './globals/notifications'

Region.SetAlertHandler(new SwalAlertHandler());

Region.GetDirectiveManager().AddHandler(new WatchDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new WhenDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new OnceDirectiveHandler());

Region.GetDirectiveManager().AddHandler(new ImageDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new IntersectionDirectiveHandler());

Region.GetDirectiveManager().AddHandler(new XHRDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new JSONDirectiveHandler());

const formDirective = new FormDirectiveHandler();

Region.GetDirectiveManager().AddHandler(formDirective);
Region.GetDirectiveManager().AddHandler(new ChangeDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new StateDirectiveHandler(formDirective));
Region.GetDirectiveManager().AddHandler(new CounterDirectiveHandler());

Region.GetGlobalManager().AddHandler(new CodeGlobalHandler());
Region.GetGlobalManager().AddHandler(new AlertGlobalHandler());

Region.GetGlobalManager().AddHandler(new MouseGlobalHandler());
Region.GetGlobalManager().AddHandler(new KeyboardGlobalHandler());
Region.GetGlobalManager().AddHandler(new ScreenGlobalHandler());

const overlayGlobal = new OverlayGlobalHandler(true);

Region.GetGlobalManager().AddHandler(overlayGlobal);
Region.GetGlobalManager().AddHandler(new ModalGlobalHandler(overlayGlobal));
Region.GetGlobalManager().AddHandler(new ThemeGlobalHandler());

const routerGlobal = new RouterGlobalHandler();

Region.GetGlobalManager().AddHandler(routerGlobal);
Region.GetGlobalManager().AddHandler(new PageGlobalHandler(routerGlobal));

const authGlobal = new AuthGlobalHandler(routerGlobal, '', false);

Region.GetGlobalManager().AddHandler(authGlobal);
Region.GetGlobalManager().AddHandler(new CartGlobalHandler(authGlobal));
Region.GetGlobalManager().AddHandler(new FavoritesGlobalHandler(authGlobal));

const resourceGlobal = new ResourceGlobalHandler();

Region.GetGlobalManager().AddHandler(resourceGlobal);
Region.GetGlobalManager().AddHandler(new GeolocationGlobalHandler());

Region.GetDirectiveManager().AddHandler(new QuillDirectiveHandler(resourceGlobal.GetHandle()));
Region.GetDirectiveManager().AddHandler(new StripeDirectiveHandler(resourceGlobal.GetHandle()));

Region.GetGlobalManager().AddHandler(new TimeagoGlobalHandler());

const echoGlobal = new EchoGlobalHandler();

Region.GetGlobalManager().AddHandler(echoGlobal);
Region.GetGlobalManager().AddHandler(new NotificationsGlobalHandler(echoGlobal, authGlobal));

Region.GetDirectiveManager().AddHandler(new ChannelDirectiveHandler(echoGlobal));
