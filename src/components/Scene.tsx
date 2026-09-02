import { Arrows } from './Arrows'
import { Orbit } from './Orbit'
import type { PortfolioSection } from '../data/sections'
import cloudRight from '../../assets/bg-graphics/Cloud Right.png'
import skyLine from '../../assets/bg-graphics/squiggly-line-sky-drawing.png'
import star from '../../assets/bg-graphics/star.png'
import sun from '../../assets/bg-graphics/Sun.png'
import goku from '../../assets/images/Goku_SSJ_Drawing.png'
import nimbus from '../../assets/images/Nimbus Cloud Pixel Art.png'

type SceneProps = {
  activeIndex: number
  navigationDirection: 0 | 1 | -1
  onNext: () => void
  onPrevious: () => void
  onSelect: (index: number) => void
  sections: PortfolioSection[]
}

export function Scene({ activeIndex, navigationDirection, onNext, onPrevious, onSelect, sections }: SceneProps) {
  return (
    <div className="scene" role="presentation">
      <img alt="" aria-hidden="true" className="scene-art scene-sun" src={sun} />
      <img alt="" aria-hidden="true" className="scene-art scene-sky-line" src={skyLine} />
      <img alt="" aria-hidden="true" className="scene-art scene-cloud scene-cloud-left" src={cloudRight} />
      <img alt="" aria-hidden="true" className="scene-art scene-cloud scene-cloud-right" src={cloudRight} />
      <img alt="" aria-hidden="true" className="scene-art scene-cloud scene-cloud-bottom" src={cloudRight} />
      <img alt="" aria-hidden="true" className="scene-art scene-star" src={star} />
      <Arrows onNext={onNext} onPrevious={onPrevious} />
      <Orbit activeIndex={activeIndex} navigationDirection={navigationDirection} onSelect={onSelect} sections={sections} />
      <div aria-label="Pixel art of Goku riding the Flying Nimbus" className="character-art" role="img">
        <img alt="" className="goku-art" src={goku} />
        <img alt="" className="nimbus-art" src={nimbus} />
      </div>
      <p className="scene-counter">{activeIndex + 1} / {sections.length}</p>
    </div>
  )
}
