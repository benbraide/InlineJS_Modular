require('./inlinejs')

import { Region } from './region'

import { ImageDirectiveHandler } from './directives/extended/image'
import { XHRDirectiveHandler, JSONDirectiveHandler } from './directives/extended/xhr'
import { FormDirectiveHandler } from './directives/extended/form'

import { AnimateDirectiveHandler } from './directives/animation/animate'
import { TypewriterDirectiveHandler } from './directives/animation/typewriter'

import { MouseGlobalHandler } from './globals/mouse'
import { ScreenGlobalHandler } from './globals/screen'
import { OverlayGlobalHandler } from './globals/overlay'
import { ThemeGlobalHandler } from './globals/theme'
import { PageGlobalHandler } from './globals/page'
import { RouterGlobalHandler } from './globals/router'
import { ResourceGlobalHandler } from './globals/resource'

import { AnimationParser } from './animation/parser'

import { SlideRightReverseAnimationActorCreator } from './animation/actors/creators/slide'
import { SpinAnimationActorCreator } from './animation/actors/creators/spin'

import { ZoomAnimationActor, ZoomTopLeftAnimationActor } from './animation/actors/zoom'
import { SlideRightReverseAnimationActor } from './animation/actors/slide'
import { SpinAnimationActor } from './animation/actors/spin'

Region.GetDirectiveManager().AddHandler(new ImageDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new XHRDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new JSONDirectiveHandler());

Region.GetDirectiveManager().AddHandler(new FormDirectiveHandler());

Region.GetDirectiveManager().AddHandler(new AnimateDirectiveHandler());
Region.GetDirectiveManager().AddHandler(new TypewriterDirectiveHandler());

Region.GetGlobalManager().AddHandler(new MouseGlobalHandler());
Region.GetGlobalManager().AddHandler(new ScreenGlobalHandler());

Region.GetGlobalManager().AddHandler(new OverlayGlobalHandler(true));
Region.GetGlobalManager().AddHandler(new ThemeGlobalHandler());

const routerGlobal = new RouterGlobalHandler();

Region.GetGlobalManager().AddHandler(routerGlobal);
Region.GetGlobalManager().AddHandler(new PageGlobalHandler(routerGlobal));

Region.GetGlobalManager().AddHandler(new ResourceGlobalHandler());

const animationParser = new AnimationParser();

animationParser.AddActorCreator(new SlideRightReverseAnimationActorCreator());
animationParser.AddActorCreator(new SpinAnimationActorCreator());

animationParser.AddActor(new ZoomAnimationActor());
animationParser.AddActor(new ZoomTopLeftAnimationActor());
animationParser.AddActor(new SlideRightReverseAnimationActor());
animationParser.AddActor(new SpinAnimationActor());

Region.SetAnimationParser(animationParser);
