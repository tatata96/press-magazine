import Image from "next/image";

type LogoMarkProps = {
  className?: string;
};

// Round Press emblem. Decorative.
export default function LogoMark({ className }: LogoMarkProps) {
  return (
    <Image
      className={className}
      src="/images/logo.svg"
      alt=""
      width={110}
      height={114}
    />
  );
}
