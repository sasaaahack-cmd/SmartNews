---
name: Mixed font families in Expo (Inter + Lora)
description: Pattern for loading multiple Google Font families in one useFonts call
---

## Rule
Import `useFonts` from ONE package (e.g. `@expo-google-fonts/lora`) and pass ALL font assets — both Inter and Lora — as a single object. Do not call `useFonts` twice (it does not merge; the second call wins).

## How to apply
```ts
import { useFonts, Lora_400Regular, Lora_700Bold } from '@expo-google-fonts/lora';
import { Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';

const [loaded, error] = useFonts({ Inter_400Regular, Inter_700Bold, Lora_400Regular, Lora_700Bold });
```

**Why:** Each `useFonts` call internally registers fonts and resolves on mount. Splitting them causes one to be ignored.
