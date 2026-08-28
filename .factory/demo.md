# Screen Bridge demo

Open `/demo` or `/?demo=1`. The sample is a connection-settings dialog with a
heading, server-address label and entry boundary, Save connection, and Cancel.
It loads the complete numbered target list in one click; choosing Analyze this
crop additionally exercises local Tesseract OCR.

Demo lists use IndexedDB database `demo:screen-bridge`. Real lists use
`screen-bridge`; demo never reads or writes it. The persistent demo banner
offers **Reset demo** (deletes and reloads demo data) and **Start for real**
(deletes demo data and goes to `/`).
