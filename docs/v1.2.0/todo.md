[ ] Dodanie funkcji wyboru trybu analizy tekstu. Na początku będą 2 tryby:

- tryb "gramatyka i ortografia" - to co mamy teraz, typowa analiza gramatyczna i ortograficzna,
- tryb "potoczna mowa" - analiza tekstu pod kątem stylistyki i sposobu pisania w mowie potocznej (gramatyka i ortografia też jest tutaj sprawdzana).

Każdy tryb będzie miał dedtykowany prompt w katalogu `src/lib/prompts/`. Na fronendzie będzie dropdown z wyborami trybów pod textarea. Musimy zastanowić się czy będą potrzebne migracje w bazie danych.
