require('./inlinejs')

import { Region } from './region'
import { SwalAlertHandler } from './alerts/swal'

import { WatchDirectiveHandler, WhenDirectiveHandler, OnceDirectiveHandler } from './directives/extended/watch'
import { ImageDirectiveHandler } from './directives/extended/image'
import { XHRDirectiveHandler, JSONDirectiveHandler } from './directives/extended/xhr'
import { FormDirectiveHandler } from './directives/extended/form'
import { ChangeDirectiveHandler } from './directives/extended/change'
import { StateDirectiveHandler } from './directives/extended/state'
import { CounterDirectiveHandler } from './directives/extended/counter'

import { AnimateDirectiveHandler } from './directives/animation/animate'
import { TypewriterDirectiveHandler } from './directives/animation/typewriter'

import { MouseGlobalHandler } from './globals/mouse'
import { AlertGlobalHandler } from './globals/alert'
import { KeyboardGlobalHandler } from './globals/keyboard'
import { ScreenGlobalHandler } from './globals/screen'
import { OverlayGlobalHandler } from './globals/overlay'
import { ThemeGlobalHandler } from './globals/theme'
import { PageGlobalHandler } from './globals/page'
import { RouterGlobalHandler } from './globals/router'
import { AuthGlobalHandler } from './globals/auth'
import { CartGlobalHandler } from './globals/cart'
import { FavoritesGlobalHandler } from './globals/favorites'
import { ResourceGlobalHandler } from './globals/resource'
import { GeolocationGlobalHandler } from './globals/geolocation'

import { AnimationParser } from './animation/parser'

import * as ZoomAnimationActorCreators from './animation/actors/creators/zoom'
import * as SlideAnimationActorCreators from './animation/actors/creators/slide'
import * as SpinAnimationActorCreators from './animation/actors/creators/spin'

import { BezierAnimationEaseCreator } from './animation/easing/creators/bezier'

import { NullAnimationActor } from './animation/actors/null'
import { OpacityAnimationActor } from './animation/actors/opacity'

import * as DimensionAnimationActors from './animation/actors/dimension'
import * as ZoomAnimationActors from './animation/actors/zoom'

import * as SlideAnimationActors from './animation/actors/slide'
import * as SpinAnimationActors from './animation/actors/spin'

import * as ShakeAnimationActors from './animation/actors/shake'
import * as VibrateAnimationActors from './animation/actors/vibrate'

import { HeartbeatAnimationActor } from './animation/actors/heartbeat'
import { PulseAnimationActor } from './animation/actors/pulse'
import { TadaAnimationActor } from './animation/actors/tada'
import { JelloAnimationActor } from './animation/actors/jello'
import { RubberbandAnimationActor } from './animation/actors/rubberband'

import { SwingAnimationActor } from './animation/actors/swing'

import { DefaultEase } from './animation/easing/default'
import { LinearEase } from './animation/easing/linear'

import * as BackAnimationEases from './animation/easing/back'
import * as BounceAnimationEases from './animation/easing/bounce'
import * as ElasticAnimationEases from './animation/easing/elastic'

import * as CircleAnimationEases from './animation/easing/circle'
import * as SineAnimationEases from './animation/easing/sine'

import * as CubicAnimationEases from './animation/easing/cubic'
import * as ExponentialAnimationEases from './animation/easing/exponential'
import * as QuadraticAnimationEases from './animation/easing/quadratic'
import * as QuartAnimationEases from './animation/easing/quart'
import * as QuintAnimationEases from './animation/easing/quint'

Region.SetAlertHandler(new SwalAlertHandler());

Region.GetDirectiveManager().AddHandler(new WatchDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new WhenDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new OnceDirectiveHandler());

Region.GetDirectiveManager().AddHandler(new ImageDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new XHRDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new JSONDirectiveHandler());

Region.GetDirectiveManager().AddHandler(new FormDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new ChangeDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new StateDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new CounterDirectiveHandler());

Region.GetDirectiveManager().AddHandler(new AnimateDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new TypewriterDirectiveHandler());

Region.GetGlobalManager().AddHandler(new AlertGlobalHandler());

Region.GetGlobalManager().AddHandler(new MouseGlobalHandler());
Region.GetGlobalManager().AddHandler(new KeyboardGlobalHandler());
Region.GetGlobalManager().AddHandler(new ScreenGlobalHandler());

Region.GetGlobalManager().AddHandler(new OverlayGlobalHandler(true));
Region.GetGlobalManager().AddHandler(new ThemeGlobalHandler());

const routerGlobal = new RouterGlobalHandler();

Region.GetGlobalManager().AddHandler(routerGlobal);
Region.GetGlobalManager().AddHandler(new PageGlobalHandler(routerGlobal));

const authGlobal = new AuthGlobalHandler(routerGlobal, '', false);

Region.GetGlobalManager().AddHandler(authGlobal);
Region.GetGlobalManager().AddHandler(new CartGlobalHandler(authGlobal));
Region.GetGlobalManager().AddHandler(new FavoritesGlobalHandler(authGlobal));

Region.GetGlobalManager().AddHandler(new ResourceGlobalHandler());
Region.GetGlobalManager().AddHandler(new GeolocationGlobalHandler());

const animationParser = new AnimationParser();

animationParser.AddActorCreator(new ZoomAnimationActorCreators.ZoomAnimationActorCreator());
animationParser.AddActorCreator(new ZoomAnimationActorCreators.ZoomWidthAnimationActorCreator());
animationParser.AddActorCreator(new ZoomAnimationActorCreators.ZoomHeightAnimationActorCreator());

animationParser.AddActorCreator(new ZoomAnimationActorCreators.ZoomInAnimationActorCreator());
animationParser.AddActorCreator(new ZoomAnimationActorCreators.ZoomInWidthAnimationActorCreator());
animationParser.AddActorCreator(new ZoomAnimationActorCreators.ZoomInHeightAnimationActorCreator());

animationParser.AddActorCreator(new ZoomAnimationActorCreators.ZoomOutAnimationActorCreator());
animationParser.AddActorCreator(new ZoomAnimationActorCreators.ZoomOutWidthAnimationActorCreator());
animationParser.AddActorCreator(new ZoomAnimationActorCreators.ZoomOutHeightAnimationActorCreator());

animationParser.AddActorCreator(new ZoomAnimationActorCreators.ZoomTopAnimationActorCreator());
animationParser.AddActorCreator(new ZoomAnimationActorCreators.ZoomTopRightAnimationActorCreator());
animationParser.AddActorCreator(new ZoomAnimationActorCreators.ZoomRightAnimationActorCreator());
animationParser.AddActorCreator(new ZoomAnimationActorCreators.ZoomBottomRightAnimationActorCreator());
animationParser.AddActorCreator(new ZoomAnimationActorCreators.ZoomBottomAnimationActorCreator());
animationParser.AddActorCreator(new ZoomAnimationActorCreators.ZoomBottomLeftAnimationActorCreator());
animationParser.AddActorCreator(new ZoomAnimationActorCreators.ZoomLeftAnimationActorCreator());
animationParser.AddActorCreator(new ZoomAnimationActorCreators.ZoomTopLeftAnimationActorCreator());

animationParser.AddActorCreator(new SlideAnimationActorCreators.SlideAnimationActorCreator());
animationParser.AddActorCreator(new SlideAnimationActorCreators.SlideUpAnimationActorCreator());
animationParser.AddActorCreator(new SlideAnimationActorCreators.SlideRightAnimationActorCreator());
animationParser.AddActorCreator(new SlideAnimationActorCreators.SlideDownAnimationActorCreator());
animationParser.AddActorCreator(new SlideAnimationActorCreators.SlideLeftAnimationActorCreator());

animationParser.AddActorCreator(new SlideAnimationActorCreators.SlideReverseAnimationActorCreator());
animationParser.AddActorCreator(new SlideAnimationActorCreators.SlideUpReverseAnimationActorCreator());
animationParser.AddActorCreator(new SlideAnimationActorCreators.SlideRightReverseAnimationActorCreator());
animationParser.AddActorCreator(new SlideAnimationActorCreators.SlideDownReverseAnimationActorCreator());
animationParser.AddActorCreator(new SlideAnimationActorCreators.SlideLeftReverseAnimationActorCreator());

animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinAnimationActorCreator());
animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinXAnimationActorCreator());
animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinYAnimationActorCreator());
animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinZAnimationActorCreator());

animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinReverseAnimationActorCreator());
animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinXReverseAnimationActorCreator());
animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinYReverseAnimationActorCreator());
animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinZReverseAnimationActorCreator());

animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinTopAnimationActorCreator());
animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinXTopAnimationActorCreator());
animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinYTopAnimationActorCreator());
animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinZTopAnimationActorCreator());

animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinTopReverseAnimationActorCreator());
animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinXTopReverseAnimationActorCreator());
animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinYTopReverseAnimationActorCreator());
animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinZTopReverseAnimationActorCreator());

animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinTopRightAnimationActorCreator());
animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinXTopRightAnimationActorCreator());
animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinYTopRightAnimationActorCreator());
animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinZTopRightAnimationActorCreator());

animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinTopRightReverseAnimationActorCreator());
animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinXTopRightReverseAnimationActorCreator());
animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinYTopRightReverseAnimationActorCreator());
animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinZTopRightReverseAnimationActorCreator());

animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinRightAnimationActorCreator());
animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinXRightAnimationActorCreator());
animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinYRightAnimationActorCreator());
animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinZRightAnimationActorCreator());

animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinRightReverseAnimationActorCreator());
animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinXRightReverseAnimationActorCreator());
animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinYRightReverseAnimationActorCreator());
animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinZRightReverseAnimationActorCreator());

animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinBottomRightAnimationActorCreator());
animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinXBottomRightAnimationActorCreator());
animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinYBottomRightAnimationActorCreator());
animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinZBottomRightAnimationActorCreator());

animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinBottomRightReverseAnimationActorCreator());
animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinXBottomRightReverseAnimationActorCreator());
animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinYBottomRightReverseAnimationActorCreator());
animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinZBottomRightReverseAnimationActorCreator());

animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinBottomAnimationActorCreator());
animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinXBottomAnimationActorCreator());
animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinYBottomAnimationActorCreator());
animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinZBottomAnimationActorCreator());

animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinBottomReverseAnimationActorCreator());
animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinXBottomReverseAnimationActorCreator());
animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinYBottomReverseAnimationActorCreator());
animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinZBottomReverseAnimationActorCreator());

animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinBottomLeftAnimationActorCreator());
animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinXBottomLeftAnimationActorCreator());
animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinYBottomLeftAnimationActorCreator());
animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinZBottomLeftAnimationActorCreator());

animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinBottomLeftReverseAnimationActorCreator());
animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinXBottomLeftReverseAnimationActorCreator());
animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinYBottomLeftReverseAnimationActorCreator());
animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinZBottomLeftReverseAnimationActorCreator());

animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinLeftAnimationActorCreator());
animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinXLeftAnimationActorCreator());
animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinYLeftAnimationActorCreator());
animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinZLeftAnimationActorCreator());

animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinLeftReverseAnimationActorCreator());
animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinXLeftReverseAnimationActorCreator());
animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinYLeftReverseAnimationActorCreator());
animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinZLeftReverseAnimationActorCreator());

animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinTopLeftAnimationActorCreator());
animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinXTopLeftAnimationActorCreator());
animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinYTopLeftAnimationActorCreator());
animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinZTopLeftAnimationActorCreator());

animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinTopLeftReverseAnimationActorCreator());
animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinXTopLeftReverseAnimationActorCreator());
animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinYTopLeftReverseAnimationActorCreator());
animationParser.AddActorCreator(new SpinAnimationActorCreators.SpinZTopLeftReverseAnimationActorCreator());

animationParser.AddEaseCreator(new BezierAnimationEaseCreator());

animationParser.AddActor(new NullAnimationActor());
animationParser.AddActor(new OpacityAnimationActor());

animationParser.AddActor(new DimensionAnimationActors.WidthAnimationActor());
animationParser.AddActor(new DimensionAnimationActors.WidthReverseAnimationActor());

animationParser.AddActor(new DimensionAnimationActors.WidthInAnimationActor());
animationParser.AddActor(new DimensionAnimationActors.WidthInReverseAnimationActor());

animationParser.AddActor(new DimensionAnimationActors.WidthOutAnimationActor());
animationParser.AddActor(new DimensionAnimationActors.WidthOutReverseAnimationActor());

animationParser.AddActor(new DimensionAnimationActors.HeightAnimationActor());
animationParser.AddActor(new DimensionAnimationActors.HeightReverseAnimationActor());

animationParser.AddActor(new DimensionAnimationActors.HeightInAnimationActor());
animationParser.AddActor(new DimensionAnimationActors.HeightInReverseAnimationActor());

animationParser.AddActor(new DimensionAnimationActors.HeightOutAnimationActor());
animationParser.AddActor(new DimensionAnimationActors.HeightOutReverseAnimationActor());

animationParser.AddActor(new DimensionAnimationActors.WidthHeightAnimationActor());
animationParser.AddActor(new DimensionAnimationActors.WidthHeightReverseAnimationActor());

animationParser.AddActor(new DimensionAnimationActors.WidthHeightInAnimationActor());
animationParser.AddActor(new DimensionAnimationActors.WidthHeightInReverseAnimationActor());

animationParser.AddActor(new DimensionAnimationActors.WidthHeightOutAnimationActor());
animationParser.AddActor(new DimensionAnimationActors.WidthHeightOutReverseAnimationActor());

animationParser.AddActor(new ZoomAnimationActors.ZoomAnimationActor());
animationParser.AddActor(new ZoomAnimationActors.ZoomWidthAnimationActor());
animationParser.AddActor(new ZoomAnimationActors.ZoomHeightAnimationActor());

animationParser.AddActor(new ZoomAnimationActors.ZoomInAnimationActor());
animationParser.AddActor(new ZoomAnimationActors.ZoomInWidthAnimationActor());
animationParser.AddActor(new ZoomAnimationActors.ZoomInHeightAnimationActor());

animationParser.AddActor(new ZoomAnimationActors.ZoomOutAnimationActor());
animationParser.AddActor(new ZoomAnimationActors.ZoomOutWidthAnimationActor());
animationParser.AddActor(new ZoomAnimationActors.ZoomOutHeightAnimationActor());

animationParser.AddActor(new ZoomAnimationActors.ZoomTopAnimationActor());
animationParser.AddActor(new ZoomAnimationActors.ZoomTopRightAnimationActor());
animationParser.AddActor(new ZoomAnimationActors.ZoomRightAnimationActor());
animationParser.AddActor(new ZoomAnimationActors.ZoomBottomRightAnimationActor());
animationParser.AddActor(new ZoomAnimationActors.ZoomBottomAnimationActor());
animationParser.AddActor(new ZoomAnimationActors.ZoomBottomLeftAnimationActor());
animationParser.AddActor(new ZoomAnimationActors.ZoomLeftAnimationActor());
animationParser.AddActor(new ZoomAnimationActors.ZoomTopLeftAnimationActor());

animationParser.AddActor(new SlideAnimationActors.SlideAnimationActor());
animationParser.AddActor(new SlideAnimationActors.SlideUpAnimationActor());
animationParser.AddActor(new SlideAnimationActors.SlideRightAnimationActor());
animationParser.AddActor(new SlideAnimationActors.SlideDownAnimationActor());
animationParser.AddActor(new SlideAnimationActors.SlideLeftAnimationActor());

animationParser.AddActor(new SlideAnimationActors.SlideReverseAnimationActor());
animationParser.AddActor(new SlideAnimationActors.SlideUpReverseAnimationActor());
animationParser.AddActor(new SlideAnimationActors.SlideRightReverseAnimationActor());
animationParser.AddActor(new SlideAnimationActors.SlideDownReverseAnimationActor());
animationParser.AddActor(new SlideAnimationActors.SlideLeftReverseAnimationActor());

animationParser.AddActor(new SpinAnimationActors.SpinAnimationActor());
animationParser.AddActor(new SpinAnimationActors.SpinXAnimationActor());
animationParser.AddActor(new SpinAnimationActors.SpinYAnimationActor());
animationParser.AddActor(new SpinAnimationActors.SpinZAnimationActor());

animationParser.AddActor(new SpinAnimationActors.SpinReverseAnimationActor());
animationParser.AddActor(new SpinAnimationActors.SpinXReverseAnimationActor());
animationParser.AddActor(new SpinAnimationActors.SpinYReverseAnimationActor());
animationParser.AddActor(new SpinAnimationActors.SpinZReverseAnimationActor());

animationParser.AddActor(new SpinAnimationActors.SpinTopAnimationActor());
animationParser.AddActor(new SpinAnimationActors.SpinXTopAnimationActor());
animationParser.AddActor(new SpinAnimationActors.SpinYTopAnimationActor());
animationParser.AddActor(new SpinAnimationActors.SpinZTopAnimationActor());

animationParser.AddActor(new SpinAnimationActors.SpinTopReverseAnimationActor());
animationParser.AddActor(new SpinAnimationActors.SpinXTopReverseAnimationActor());
animationParser.AddActor(new SpinAnimationActors.SpinYTopReverseAnimationActor());
animationParser.AddActor(new SpinAnimationActors.SpinZTopReverseAnimationActor());

animationParser.AddActor(new SpinAnimationActors.SpinTopRightAnimationActor());
animationParser.AddActor(new SpinAnimationActors.SpinXTopRightAnimationActor());
animationParser.AddActor(new SpinAnimationActors.SpinYTopRightAnimationActor());
animationParser.AddActor(new SpinAnimationActors.SpinZTopRightAnimationActor());

animationParser.AddActor(new SpinAnimationActors.SpinTopRightReverseAnimationActor());
animationParser.AddActor(new SpinAnimationActors.SpinXTopRightReverseAnimationActor());
animationParser.AddActor(new SpinAnimationActors.SpinYTopRightReverseAnimationActor());
animationParser.AddActor(new SpinAnimationActors.SpinZTopRightReverseAnimationActor());

animationParser.AddActor(new SpinAnimationActors.SpinRightAnimationActor());
animationParser.AddActor(new SpinAnimationActors.SpinXRightAnimationActor());
animationParser.AddActor(new SpinAnimationActors.SpinYRightAnimationActor());
animationParser.AddActor(new SpinAnimationActors.SpinZRightAnimationActor());

animationParser.AddActor(new SpinAnimationActors.SpinRightReverseAnimationActor());
animationParser.AddActor(new SpinAnimationActors.SpinXRightReverseAnimationActor());
animationParser.AddActor(new SpinAnimationActors.SpinYRightReverseAnimationActor());
animationParser.AddActor(new SpinAnimationActors.SpinZRightReverseAnimationActor());

animationParser.AddActor(new SpinAnimationActors.SpinBottomRightAnimationActor());
animationParser.AddActor(new SpinAnimationActors.SpinXBottomRightAnimationActor());
animationParser.AddActor(new SpinAnimationActors.SpinYBottomRightAnimationActor());
animationParser.AddActor(new SpinAnimationActors.SpinZBottomRightAnimationActor());

animationParser.AddActor(new SpinAnimationActors.SpinBottomRightReverseAnimationActor());
animationParser.AddActor(new SpinAnimationActors.SpinXBottomRightReverseAnimationActor());
animationParser.AddActor(new SpinAnimationActors.SpinYBottomRightReverseAnimationActor());
animationParser.AddActor(new SpinAnimationActors.SpinZBottomRightReverseAnimationActor());

animationParser.AddActor(new SpinAnimationActors.SpinBottomAnimationActor());
animationParser.AddActor(new SpinAnimationActors.SpinXBottomAnimationActor());
animationParser.AddActor(new SpinAnimationActors.SpinYBottomAnimationActor());
animationParser.AddActor(new SpinAnimationActors.SpinZBottomAnimationActor());

animationParser.AddActor(new SpinAnimationActors.SpinBottomReverseAnimationActor());
animationParser.AddActor(new SpinAnimationActors.SpinXBottomReverseAnimationActor());
animationParser.AddActor(new SpinAnimationActors.SpinYBottomReverseAnimationActor());
animationParser.AddActor(new SpinAnimationActors.SpinZBottomReverseAnimationActor());

animationParser.AddActor(new SpinAnimationActors.SpinBottomLeftAnimationActor());
animationParser.AddActor(new SpinAnimationActors.SpinXBottomLeftAnimationActor());
animationParser.AddActor(new SpinAnimationActors.SpinYBottomLeftAnimationActor());
animationParser.AddActor(new SpinAnimationActors.SpinZBottomLeftAnimationActor());

animationParser.AddActor(new SpinAnimationActors.SpinBottomLeftReverseAnimationActor());
animationParser.AddActor(new SpinAnimationActors.SpinXBottomLeftReverseAnimationActor());
animationParser.AddActor(new SpinAnimationActors.SpinYBottomLeftReverseAnimationActor());
animationParser.AddActor(new SpinAnimationActors.SpinZBottomLeftReverseAnimationActor());

animationParser.AddActor(new SpinAnimationActors.SpinLeftAnimationActor());
animationParser.AddActor(new SpinAnimationActors.SpinXLeftAnimationActor());
animationParser.AddActor(new SpinAnimationActors.SpinYLeftAnimationActor());
animationParser.AddActor(new SpinAnimationActors.SpinZLeftAnimationActor());

animationParser.AddActor(new SpinAnimationActors.SpinLeftReverseAnimationActor());
animationParser.AddActor(new SpinAnimationActors.SpinXLeftReverseAnimationActor());
animationParser.AddActor(new SpinAnimationActors.SpinYLeftReverseAnimationActor());
animationParser.AddActor(new SpinAnimationActors.SpinZLeftReverseAnimationActor());

animationParser.AddActor(new SpinAnimationActors.SpinTopLeftAnimationActor());
animationParser.AddActor(new SpinAnimationActors.SpinXTopLeftAnimationActor());
animationParser.AddActor(new SpinAnimationActors.SpinYTopLeftAnimationActor());
animationParser.AddActor(new SpinAnimationActors.SpinZTopLeftAnimationActor());

animationParser.AddActor(new SpinAnimationActors.SpinTopLeftReverseAnimationActor());
animationParser.AddActor(new SpinAnimationActors.SpinXTopLeftReverseAnimationActor());
animationParser.AddActor(new SpinAnimationActors.SpinYTopLeftReverseAnimationActor());
animationParser.AddActor(new SpinAnimationActors.SpinZTopLeftReverseAnimationActor());

animationParser.AddActor(new ShakeAnimationActors.ShakeAnimatorActor());
animationParser.AddActor(new ShakeAnimationActors.ShakeXAnimatorActor());
animationParser.AddActor(new ShakeAnimationActors.ShakeYAnimatorActor());

animationParser.AddActor(new VibrateAnimationActors.VibrateAnimatorActor());
animationParser.AddActor(new VibrateAnimationActors.VibrateXAnimatorActor());
animationParser.AddActor(new VibrateAnimationActors.VibrateYAnimatorActor());
animationParser.AddActor(new VibrateAnimationActors.VibrateZAnimatorActor());

animationParser.AddActor(new HeartbeatAnimationActor());
animationParser.AddActor(new PulseAnimationActor());
animationParser.AddActor(new TadaAnimationActor());
animationParser.AddActor(new JelloAnimationActor());
animationParser.AddActor(new RubberbandAnimationActor());
animationParser.AddActor(new SwingAnimationActor());

animationParser.AddEase(new DefaultEase());
animationParser.AddEase(new LinearEase());

animationParser.AddEase(new BackAnimationEases.BackEase());
animationParser.AddEase(new BackAnimationEases.BackInEase());
animationParser.AddEase(new BackAnimationEases.BackOutEase());
animationParser.AddEase(new BackAnimationEases.BackInOutEase());

animationParser.AddEase(new BounceAnimationEases.BounceEase());
animationParser.AddEase(new BounceAnimationEases.BounceInEase());
animationParser.AddEase(new BounceAnimationEases.BounceOutEase());
animationParser.AddEase(new BounceAnimationEases.BounceInOutEase());

animationParser.AddEase(new ElasticAnimationEases.ElasticEase());
animationParser.AddEase(new ElasticAnimationEases.ElasticInEase());
animationParser.AddEase(new ElasticAnimationEases.ElasticOutEase());
animationParser.AddEase(new ElasticAnimationEases.ElasticInOutEase());

animationParser.AddEase(new CircleAnimationEases.CircleEase());
animationParser.AddEase(new CircleAnimationEases.CircleInEase());
animationParser.AddEase(new CircleAnimationEases.CircleOutEase());
animationParser.AddEase(new CircleAnimationEases.CircleInOutEase());

animationParser.AddEase(new SineAnimationEases.SineEase());
animationParser.AddEase(new SineAnimationEases.SineInEase());
animationParser.AddEase(new SineAnimationEases.SineOutEase());
animationParser.AddEase(new SineAnimationEases.SineInOutEase());

animationParser.AddEase(new CubicAnimationEases.CubicEase());
animationParser.AddEase(new CubicAnimationEases.CubicInEase());
animationParser.AddEase(new CubicAnimationEases.CubicOutEase());
animationParser.AddEase(new CubicAnimationEases.CubicInOutEase());

animationParser.AddEase(new ExponentialAnimationEases.ExponentialEase());
animationParser.AddEase(new ExponentialAnimationEases.ExponentialInEase());
animationParser.AddEase(new ExponentialAnimationEases.ExponentialOutEase());
animationParser.AddEase(new ExponentialAnimationEases.ExponentialInOutEase());

animationParser.AddEase(new QuadraticAnimationEases.QuadraticEase());
animationParser.AddEase(new QuadraticAnimationEases.QuadraticInEase());
animationParser.AddEase(new QuadraticAnimationEases.QuadraticOutEase());
animationParser.AddEase(new QuadraticAnimationEases.QuadraticInOutEase());

animationParser.AddEase(new QuartAnimationEases.QuartEase());
animationParser.AddEase(new QuartAnimationEases.QuartInEase());
animationParser.AddEase(new QuartAnimationEases.QuartOutEase());
animationParser.AddEase(new QuartAnimationEases.QuartInOutEase());

animationParser.AddEase(new QuintAnimationEases.QuintEase());
animationParser.AddEase(new QuintAnimationEases.QuintInEase());
animationParser.AddEase(new QuintAnimationEases.QuintOutEase());
animationParser.AddEase(new QuintAnimationEases.QuintInOutEase());

Region.SetAnimationParser(animationParser);
