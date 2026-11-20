import {
  AnimatedSpan,
  Terminal as TerminalUI,
  TypingAnimation,
} from "@repo/design-system/components/ui/terminal";
import { cn } from "@repo/design-system/lib/utils";
import layout from "./hero-layout.module.css";

interface TerminalProps {
  interests: string;
  user: string;
}

export function Terminal({ user, interests }: TerminalProps) {
  return (
    <TerminalUI className={cn(layout.terminalPanel, "backdrop-blur")}>
      <TypingAnimation delay={0}>$ whoami</TypingAnimation>

      <AnimatedSpan className="text-primary" delay={800}>
        {user}
      </AnimatedSpan>

      <TypingAnimation delay={1600}>$ ls interests</TypingAnimation>

      <AnimatedSpan className="text-muted-foreground" delay={2400}>
        {interests}
      </AnimatedSpan>
    </TerminalUI>
  );
}
