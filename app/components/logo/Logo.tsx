import Image from "next/image";

type LogoProps = {
  className?: string;
  priority?: boolean;
};

// Press logotype. Decorative by default; callers add a label where it is the only text.
export default function Logo({ className, priority }: LogoProps) {
  return (
    <Image
      className={className}
      src="/images/logo-text.svg"
      alt=""
      width={1223}
      height={513}
      priority={priority}
    />
  );
}
