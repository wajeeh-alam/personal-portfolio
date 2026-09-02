import arrowLeft from '../../assets/images/Arrow Left.svg'
import arrowRight from '../../assets/images/Arrow Right.svg'

type ArrowsProps = {
  onNext: () => void
  onPrevious: () => void
}

export function Arrows({ onNext, onPrevious }: ArrowsProps) {
  return (
    <div aria-label="Section controls" className="scene-arrows" role="group">
      <button aria-label="Previous section" className="arrow-button arrow-button-left" onClick={onPrevious} type="button">
        <img alt="" aria-hidden="true" src={arrowLeft} />
      </button>
      <button aria-label="Next section" className="arrow-button arrow-button-right" onClick={onNext} type="button">
        <img alt="" aria-hidden="true" src={arrowRight} />
      </button>
    </div>
  )
}
