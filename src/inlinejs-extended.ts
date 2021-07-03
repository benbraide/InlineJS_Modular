require('./inlinejs')

import { Region } from './region'

import { TypewriterDirectiveHandler } from './directives/animation/typewriter'

Region.GetDirectiveManager().AddHandler(new TypewriterDirectiveHandler());
