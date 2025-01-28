import { useState } from 'react';
import { IoCopyOutline } from 'react-icons/io5';
import Lottie from 'react-lottie';
import { cn } from '@/lib/utils';
import { BackgroundGradientAnimation } from './GradientBg';
import animationData from '@/data/confetti.json';
import MagicButton from '../MagicButton';
import "@/globals.css";

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    // 2 columns on md+ screens
    <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-4', className)}>
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  id,
  title,
  description,
  img,
  imgClassName,
  titleClassName,
  spareImg,
}: {
  className?: string;
  id: number;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  img?: string;
  imgClassName?: string;
  titleClassName?: string;
  spareImg?: string;
}) => {
  // For the confetti in item #5
  const [copied, setCopied] = useState(false);

  // For item #2's vertical scroller
  const items = [
    'COMP. SCI PRESIDENT',
    'V.P STUDENT COUNCIL',
    'HACK CLUB FOUNDER',
    'MATH TUTOR',
    'PHOTOGRAPHER',
    'GAME DEV',
    'FRISBEE CHAMP',
    'PROGRAMMER',
  ];

  // Confetti animation settings
  const defaultOptions = {
    loop: copied,
    autoplay: copied,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  const handleCopy = () => {
    const email = 'alamwajeeh@gmail.com';
    navigator.clipboard.writeText(email);
    setCopied(true);
  };

  // storing cookie's position
  const [cookiePos, setCookiePos] = useState({ top: 50, left: 50 });

  const handleCookieClick = () => {
    const randomTop = Math.floor(Math.random() * 85) + 5;
    const randomLeft = Math.floor(Math.random() * 85) + 5;
    setCookiePos({ top: randomTop, left: randomLeft });
  };

  return (
    <div
      className={cn(
        'relative h-[25vh] overflow-hidden rounded-3xl border border-white/[0.1] group/bento hover:shadow-xl transition duration-200 shadow-input dark:shadow-none flex justify-center items-center space-y-4',
        className
      )}
      style={{
        background: 'rgb(4,7,29)',
        backgroundColor:
          'linear-gradient(90deg, rgba(4,7,29,1) 0%, rgba(12,14,35,1) 100%)',
      }}
    >
      {id !== 1 && (
        <div className="w-full h-full absolute">
          {img && (
            <img
              src={img}
              alt={img}
              className={cn(imgClassName, 'object-cover object-center')}
            />
          )}
        </div>
      )}

      {/* Spare image */}
      <div className="absolute right-0 -bottom-5">
        {spareImg && (
          <img
            src={spareImg}
            alt={spareImg}
            className="object-cover object-center w-full h-full"
          />
        )}
      </div>

      {/* item #5 fancy background gradient */}
      {id === 5 && (
        <BackgroundGradientAnimation>
          <div className="absolute z-50 inset-0 flex items-center justify-center text-white font-bold px-4 pointer-events-none text-3xl text-center md:text-4xl lg:text-7xl"></div>
        </BackgroundGradientAnimation>
      )}

      {id === 1 && img && (
        <img
          src={img}
          alt="Cookie"
          style={{
            position: 'absolute',
            top: `${cookiePos.top}%`,
            left: `${cookiePos.left}%`,
            transform: 'translate(-50%, -50%)',
            maxWidth: '150px',
            cursor: 'pointer',
            zIndex: 50,
          }}
          onClick={handleCookieClick}
        />
      )}

      <div
        className={cn(
          titleClassName,
          'group-hover/bento:translate-x-2 transition duration-200 relative md:h-full min-h-40 flex flex-col px-5 p-5 lg:p-10'
        )}
      >
        {/* Overridden item #4 => Linktree */}
        {id === 4 ? (
          <div className="flex flex-col items-start space-y-2">
            <span className="text-sm uppercase tracking-wider text-pink-500">
              My Socials
            </span>
            <a
              href="https://linktr.ee/wajeehalam"
              target="_blank"
              rel="noopener noreferrer"
              className="text-2xl font-bold text-white hover:text-pink-400 transition"
            >
              Connect With Me
            </a>
          </div>
        ) : (
          <>
            {/* Otherwise, default text */}
            <div className="font-sans font-extralight md:max-w-32 md:text-xs lg:text-base text-sm text-[#3d45eb] z-10">
              {description}
            </div>
            <div className="font-sans text-lg lg:text-3xl max-w-96 font-bold z-10">
              {title}
            </div>
          </>
        )}

        {id === 2 && (
          <div className="flex gap-1 lg:gap-5 w-fit absolute top-1/2 -translate-y-1/2 right-4">
            <ScrollingContainer items={items} />
          </div>
        )}

        {/* "Copy Email" */}
        {id === 5 && (
          <div className="relative">
            <div
              className={`absolute -bottom-5 right-0 ${
                copied ? 'block' : 'block'
              }`}
            >
              <Lottie options={defaultOptions} height={200} width={400} />
            </div>
            <MagicButton
              title={copied ? 'Email is Copied!' : 'Copy my email address'}
              icon={<IoCopyOutline />}
              position="left"
              handleClick={handleCopy}
              otherClasses="!bg-[#161A31]"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export const ScrollingContainer = ({ items }: { items: string[] }) => {
  return (
    <div className="relative w-full h-64 flex justify-end">
      <div className="absolute left-0 w-auto h-full overflow-hidden">
        <div className="flex flex-col gap-3 animate-vertical-scroll">
          {items.concat(items).map((item, index) => (
            <span
              key={index}
              className="py-2 px-4 bg-[#10132E] rounded-lg text-white text-sm lg:text-base text-center"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};