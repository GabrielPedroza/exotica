import Link from "next/link";

type IButtonProps = {
  textSize?: "sm" | "md" | "lg";
  className?: string;
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
};

const Button = ({
  textSize = "md",
  className = "",
  href = "",
  children,
  ...rest
}: IButtonProps) => {
  return (
    <Link
      href={href}
      className={`rounded bg-blue-500 px-6 py-4 text-white text-${textSize} hover:bg-blue-700 ${className}`}
      {...rest}
    >
      {children}
    </Link>
  );
};

export default Button;
