import Link from "next/link";
import { twMerge } from "tailwind-merge";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export const Logo: React.FC<LogoProps> = ({ className, width, height }) => (
  <Link href="/">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 800 240"
      className={twMerge("text-primary-contrast", className)}
    >
      <path
        className="fill-current"
        d="M640.53,96.32c-.57-1.64-1.45-3.16-2.65-4.55-1.2-1.39-2.69-2.56-4.45-3.51-1.77-.94-3.86-1.42-6.26-1.42-1.26,0-2.36-.41-3.31-1.23s-1.42-1.99-1.42-3.5c0-3.92-1.39-7.27-4.17-10.05-2.78-2.77-6.12-4.16-10.04-4.16h-37.88c-3.92,0-7.26,1.38-10.04,4.16-2.78,2.78-4.17,6.13-4.17,10.05h.01v18.94c0-3.91-1.4-7.26-4.17-10.04-2.78-2.78-6.13-4.17-10.04-4.17-1.26,0-2.37-.44-3.32-1.32-.94-.89-1.42-2.02-1.42-3.41,0-3.92-1.39-7.27-4.16-10.05-2.78-2.77-6.13-4.16-10.04-4.16h-28.42c-3.91,0-7.25,1.38-10.03,4.16-2.78,2.78-4.17,6.13-4.17,10.05,0,1.13-.45,2.21-1.33,3.22-.88,1.01-2.02,1.51-3.41,1.51-3.91,0-7.26,1.39-10.04,4.17s-4.16,6.13-4.16,10.04v37.9c0,3.23,.94,6.08,2.84,8.54-2.7-2.53-5.92-3.81-9.66-3.81h-9.47c-1.14,0-2.21-.4-3.22-1.23-1.01-.82-1.52-1.99-1.52-3.5V44.21c0-3.91-1.39-7.26-4.17-10.04-2.77-2.78-6.12-4.17-10.03-4.17s-7.26,1.39-10.04,4.17c-2.78,2.78-4.17,6.13-4.17,10.04v37.9c0-3.92-1.39-7.27-4.17-10.05-2.78-2.77-6.12-4.16-10.04-4.16s-7.26,1.38-10.04,4.16c-2.78,2.78-4.16,6.13-4.16,10.05v56.84c0,1.39-.45,2.53-1.33,3.41s-2.02,1.32-3.41,1.32h-28.41c-1.39,0-2.53-.44-3.41-1.32-.88-.88-1.33-2.02-1.33-3.41v-56.84c0-3.92-1.39-7.27-4.16-10.05-2.78-2.77-6.13-4.16-10.04-4.16s-7.26,1.38-10.04,4.16c-2.78,2.78-4.17,6.13-4.17,10.05v18.71c-.05-3.81-1.44-7.09-4.16-9.81-2.78-2.78-6.13-4.17-10.04-4.17-1.39,0-2.53-.44-3.41-1.32-.89-.89-1.33-2.02-1.33-3.42,0-3.91-1.39-7.26-4.17-10.04-2.77-2.77-6.12-4.17-10.03-4.17h-28.42c-1.13,0-2.21-.4-3.22-1.23-1.01-.82-1.51-1.99-1.51-3.5v-18.95c0-3.91-1.39-7.26-4.17-10.04-2.78-2.78-6.12-4.17-10.04-4.17s-7.26,1.39-10.04,4.17c-2.78,2.78-4.16,6.13-4.16,10.04v56.84c0-3.91-1.4-7.26-4.17-10.04-2.78-2.78-6.13-4.17-10.04-4.17-1.01,0-2.06-.41-3.13-1.23s-1.61-1.99-1.61-3.5c0-3.92-1.39-7.27-4.17-10.05-2.77-2.77-6.12-4.16-10.04-4.16h-47.35c-3.91,0-7.26,1.38-10.04,4.16-2.78,2.78-4.16,6.13-4.16,10.05s1.39,7.26,4.16,10.04c2.78,2.78,6.13,4.17,10.04,4.17h47.35c1.02,0,2.06,.41,3.13,1.23s1.61,1.99,1.61,3.5-.54,2.69-1.61,3.51-2.11,1.23-3.13,1.23h-47.35c-3.91,0-7.26,1.39-10.04,4.17-2.74,2.74-4.13,6.05-4.16,9.9v-18.81c0-3.91-1.4-7.26-4.17-10.04-2.78-2.78-6.13-4.17-10.04-4.17-1.39,0-2.53-.44-3.41-1.32-.88-.89-1.32-2.02-1.32-3.42,0-3.91-1.4-7.26-4.17-10.04-2.78-2.77-6.13-4.17-10.04-4.17h-28.41c-1.14,0-2.21-.4-3.22-1.23-1.01-.82-1.52-1.99-1.52-3.5v-18.95c0-3.91-1.39-7.26-4.17-10.04-2.77-2.78-6.12-4.17-10.03-4.17s-7.26,1.39-10.04,4.17c-2.78,2.78-4.17,6.13-4.17,10.04v113.69c0,3.91,1.39,7.26,4.17,10.04,2.77,2.78,6.12,4.17,10.04,4.17h47.35c3.91,0,7.26-1.4,10.04-4.17,2.77-2.78,4.17-6.13,4.17-10.04,0-1.52,.5-2.69,1.51-3.51,1.01-.82,2.08-1.23,3.22-1.23,3.91,0,7.26-1.39,10.04-4.17,2.78-2.78,4.17-6.13,4.17-10.04,0,3.91,1.39,7.26,4.17,10.04,2.77,2.78,6.12,4.17,10.03,4.17,1.14,0,2.21,.44,3.22,1.33,1.01,.88,1.52,2.02,1.52,3.41,0,3.91,1.39,7.26,4.17,10.04,2.77,2.78,6.12,4.17,10.03,4.17h47.36c3.91,0,7.26-1.39,10.04-4.17,2.78-2.78,4.17-6.13,4.17-10.04,0,3.91,1.39,7.26,4.16,10.04,2.78,2.78,6.13,4.17,10.04,4.17h47.36c3.91,0,7.26-1.4,10.03-4.17,2.78-2.78,4.17-6.13,4.17-10.04,0-1.52,.51-2.69,1.52-3.51,1.01-.82,2.08-1.23,3.22-1.23,3.91,0,7.26-1.39,10.04-4.17,2.73-2.74,4.12-6.03,4.16-9.88,.04,3.85,1.43,7.14,4.17,9.88,2.77,2.78,6.12,4.17,10.04,4.17,1.39,0,2.52,.47,3.41,1.42,.88,.95,1.32,2.06,1.32,3.32,0,3.91,1.39,7.26,4.17,10.04s6.12,4.17,10.04,4.17h28.41c1.39,0,2.53,.44,3.41,1.32,.88,.89,1.33,2.02,1.33,3.41s-.45,2.53-1.33,3.41c-.88,.89-2.02,1.33-3.41,1.33h-47.35c-3.92,0-7.27,1.39-10.04,4.17-2.78,2.77-4.17,6.13-4.17,10.04s1.39,7.27,4.17,10.04c2.77,2.78,6.12,4.17,10.04,4.17h47.35c3.91,0,7.26-1.39,10.04-4.17,2.78-2.78,4.17-6.13,4.17-10.04,0-1.26,.44-2.37,1.32-3.31,.88-.95,2.02-1.43,3.41-1.43,3.91,0,7.26-1.39,10.04-4.16,2.78-2.78,4.17-6.13,4.17-10.05v-37.89c0,3.91,1.39,7.26,4.17,10.04,2.77,2.78,6.12,4.17,10.04,4.17,1.13,0,2.2,.41,3.22,1.23,1,.82,1.51,1.99,1.51,3.51,0,3.91,1.39,7.26,4.17,10.04,2.77,2.78,6.12,4.17,10.04,4.17h9.47c3.91,0,7.26-1.4,10.03-4.17,2.78-2.78,4.17-6.13,4.17-10.04,0-3.24-.95-6.09-2.85-8.55,2.7,2.54,5.93,3.81,9.67,3.81,1.39,0,2.53,.44,3.41,1.33,.88,.88,1.33,2.02,1.33,3.41,0,3.91,1.39,7.26,4.17,10.04,2.77,2.78,6.12,4.17,10.03,4.17h28.42c3.91,0,7.26-1.4,10.04-4.17,2.77-2.78,4.16-6.13,4.16-10.04,0-1.01,.41-2.06,1.24-3.13,.81-1.07,1.98-1.61,3.5-1.61,3.91,0,7.26-1.39,10.04-4.17,2.78-2.78,4.17-6.13,4.17-10.04v18.95c0,3.91,1.38,7.26,4.16,10.04,2.78,2.78,6.13,4.17,10.04,4.17s7.26-1.4,10.04-4.17c2.78-2.78,4.17-6.13,4.17-10.04v-56.85c0-1.26,.44-2.37,1.32-3.31,.89-.95,2.02-1.42,3.41-1.42h18.94c1.14,0,2.21,.44,3.22,1.32,1.01,.89,1.52,2.02,1.52,3.41v56.85c0,3.91,1.39,7.26,4.17,10.04,2.77,2.78,6.12,4.17,10.03,4.17s7.27-1.4,10.04-4.17c2.78-2.78,4.17-6.13,4.17-10.04v-56.85c0-1.51-.28-3.09-.85-4.73ZM99.46,138.95c0,1.64-.5,2.84-1.51,3.6s-2.08,1.13-3.22,1.13h-28.41c-1.27,0-2.37-.44-3.32-1.32-.94-.88-1.42-2.02-1.42-3.41v-37.9c0-1.13,.44-2.21,1.33-3.22,.88-1.01,2.02-1.51,3.41-1.51h28.41c1.39,0,2.52,.47,3.41,1.42,.88,.94,1.32,2.05,1.32,3.31v37.9Zm93.2,3.41c-1.02,.88-2.09,1.32-3.23,1.32h-28.41c-1.13,0-2.21-.44-3.22-1.32s-1.51-2.02-1.51-3.41c0-1.14,.44-2.21,1.32-3.22,.89-1.01,2.02-1.52,3.41-1.52h28.41c1.39,0,2.53,.51,3.41,1.52,.89,1.01,1.33,2.08,1.33,3.22,0,1.39-.51,2.53-1.51,3.41Zm96.22-3.41c0,1.64-.51,2.84-1.51,3.6-1.02,.76-2.09,1.13-3.22,1.13h-28.41c-1.27,0-2.37-.44-3.32-1.32s-1.42-2.02-1.42-3.41v-37.9c0-1.13,.44-2.21,1.32-3.22,.89-1.01,2.02-1.51,3.41-1.51h28.42c1.38,0,2.52,.47,3.41,1.42,.88,.94,1.32,2.05,1.32,3.31v37.9Zm238.85,0c0,1.64-.51,2.84-1.51,3.6-1.02,.76-2.09,1.13-3.22,1.13h-28.41c-1.27,0-2.37-.44-3.32-1.32-.95-.88-1.42-2.02-1.42-3.41v-37.9c0-1.13,.44-2.2,1.33-3.22,.88-1.01,2.01-1.51,3.4-1.51h28.42c1.38,0,2.52,.47,3.41,1.42,.88,.94,1.32,2.05,1.32,3.31v37.9Zm142.59-91.14c-.47-1.28-.16-2.71,.81-3.68l13.11-13.11c.96-.96,2.4-1.28,3.68-.81l27.96,10.27c.69,.25,1.14,.91,1.14,1.64v6.12c0,.46-.18,.91-.51,1.23l-6.8,6.8c-.48,.48-1.2,.64-1.84,.4l-7.51-2.77-8.25-3.04c-.7-.26-1.38,.42-1.12,1.12l5.81,15.76c.24,.64,.08,1.36-.4,1.84l-6.05,6.05c-.68,.68-.68,1.79,0,2.47l6.08,6.08c.48,.48,.64,1.2,.4,1.84l-5.81,15.76c-.26,.7,.42,1.38,1.12,1.12l15.76-5.81c.64-.24,1.36-.08,1.84,.4l6.77,6.77c.33,.33,.51,.77,.51,1.23v6.12c0,.73-.45,1.38-1.14,1.64l-27.92,10.3c-1.28,.47-2.71,.16-3.68-.81l-13.11-13.11c-.96-.96-1.28-2.4-.81-3.68l10.27-27.83c.29-.78,.29-1.64,0-2.42l-10.3-27.92Zm96.3,58.16c.47,1.28,.16,2.71-.81,3.68l-13.11,13.11c-.96,.96-2.4,1.28-3.68,.81l-27.96-10.27c-.69-.25-1.14-.91-1.14-1.64v-6.12c0-.46,.18-.91,.51-1.23l6.8-6.8c.48-.48,1.2-.64,1.84-.4l7.51,2.77,8.25,3.04c.7,.26,1.38-.42,1.12-1.12l-5.81-15.76c-.24-.64-.08-1.36,.4-1.84l6.05-6.05c.68-.68,.68-1.79,0-2.47l-6.08-6.08c-.48-.48-.64-1.2-.4-1.84l5.81-15.76c.26-.7-.42-1.38-1.12-1.12l-15.76,5.81c-.64,.24-1.36,.08-1.84-.4l-6.77-6.77c-.33-.33-.51-.77-.51-1.23v-6.12c0-.73,.46-1.38,1.14-1.64l27.92-10.3c1.28-.47,2.71-.16,3.68,.81l13.11,13.11c.96,.96,1.28,2.4,.81,3.68l-10.27,27.83c-.29,.78-.29,1.64,0,2.42l10.3,27.92h0Z"
      />
    </svg>
  </Link>
);
