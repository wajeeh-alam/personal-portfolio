import { useState } from 'react';
import { IoCopyOutline } from 'react-icons/io5';
import Lottie from 'react-lottie';
import { cn } from '@/lib/utils';
import { BackgroundGradientAnimation } from './GradientBg';
import animationData from '@/data/confetti.json';
import MagicButton from '../MagicButton';

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
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
  const [copied, setCopied] = useState(false);

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
      {id !== 1 && img && (
        <div className="w-full h-full absolute">
          <img
            src={img}
            alt={img}
            className={cn(imgClassName, 'object-cover object-center')}
          />
        </div>
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
        {id === 4 ? (
          <div className="flex flex-col items-center space-y-4">
            {/* Title */}
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

            {/* Social Media Icons */}
            <div className="flex gap-4">
              <a
                href="https://www.linkedin.com/in/wajeeh-alam-9442b82bb/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-110 transition-transform"
              >
                <img src="/linkedin.png" alt="LinkedIn" className="w-10 h-10" />
              </a>
              <a
                href="https://github.com/Mr-W-Squidward"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-110 transition-transform"
              >
                <img src="/github.svg" alt="GitHub" className="w-10 h-10" />
              </a>
              <a
                href="https://www.instagram.com/wajeehalam_/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-110 transition-transform"
              >
                <img
                  src="/instagram.svg"
                  alt="Instagram"
                  className="w-10 h-10"
                />
              </a>
            </div>
          </div>
        ) : (
          <>
            <div className="font-sans font-extralight md:max-w-32 md:text-xs lg:text-base text-sm text-[#3d45eb] z-10">
              {description}
            </div>
            <div className="font-sans text-lg lg:text-3xl max-w-96 font-bold z-10">
              {title}
            </div>
          </>
        )}

        {id === 2 && (
          <div className="w-full flex justify-between items-center">
            <ScrollingContainer items={items} />
          </div>
        )}

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
    <div className="relative w-full h-64 flex justify-between px-4 items-center bottom-10">
      {/* Left Scrolling Section */}
      <div className="w-auto h-full overflow-hidden flex justify-start">
        <div className="flex flex-col gap-3 animate-vertical-scroll">
          {items.concat(items).map((item, index) => (
            <span
              key={`left-${index}`}
              className="py-2 px-4 bg-[#10132E] rounded-lg text-white text-sm lg:text-base text-center"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Center Content (Download Resume) */}
      <a
        href="/Wajeeh_Alam_Resume.pdf"
        target="_blank"
        rel="noopener noreferrer"
        className="text-white font-bold text-xl lg:text-3xl text-center hover:scale-110 transition-transform"
      >
        Download <span className="text-blue-500">Resume</span>
      </a>

      {/* Right Scrolling Section */}
      <div className="w-auto h-full overflow-hidden flex justify-end">
        <div className="flex flex-col gap-3 animate-vertical-scroll">
          {items.concat(items).map((item, index) => (
            <span
              key={`right-${index}`}
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