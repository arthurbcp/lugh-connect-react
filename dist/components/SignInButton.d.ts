import type { JSX, ReactNode } from "react";
export interface LughSignInButtonProps {
    children?: ReactNode;
    className?: string;
    /** Substitui completamente as classes padrão do botão (`lugh-btn`). */
    classOverride?: string;
    showIcon?: boolean;
    onClick?: () => void;
    onError?: (err: Error) => void;
}
export declare function LughSignInButton({ children, className, classOverride, showIcon, onClick, onError, }: LughSignInButtonProps): JSX.Element;
//# sourceMappingURL=SignInButton.d.ts.map