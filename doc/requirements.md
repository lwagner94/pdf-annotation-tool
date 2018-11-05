## Functional requirements
- Users can upload PDF documents
- Users can display uploaded documents that are then shown in the browser in a
similar manner as regular in-browser PDF readers (e.g. PDF.js)
- Users can add a set of different annotations to the PDF document
    + Rectangular box (highlighting)
    + Rectangular box with text (comments)
    + Sticky note (small box that expands upon clicking to reveal additional text)
- Users can edit and remove existing annotations
- Users can use an export function that produces a file which contains the annotations previously created
- Users can import previously created annotation files
- The application ensures that the imported annotation file was created with
the same PDF document as currently displayed
- The application should handle PDFs in different formats (A4, Letter, etc.)
- The current state should be stored so that a user can continue working on a
document even after closing and reopening the browser window
- **OPTIONAL:** Simple session/user management for the case that the server is not run locally, but on a public server
    + Users should only have access to the documents that they uploaded themselves
- **OPTIONAL:** Use a PDF library such as [libpoppler][1] or [PDFBox][2] to
either store the annotations natively in the PDF document *or* embed the
exported annotation file inside the PDF document

## Non-Functional requirements
- The application should work with reasonable current versions of Google 
Chrome and Mozilla Firefox
- The user interface should be intuitive and easily discoverable by users
- The application should remain responsive even when editing large documents.
    + If an operation that takes longer to finish is performed, the user should see a progress spinner or similar
- The format of the exported file is such that it can be easily parsed by computers
- The application should be easily extensible:
    + The implementations of the different types of annotations use a well defined interface provided by the rest of the application
    + Possibly use a simple plugin system to add more annotations later
    + Decouple annotation rendering and associated data such as size, position,
    content (if present)
    + The steps that are needed to create new annotation types should be well documented
- Core functionality of the application should be automatically testable with unit/integration tests

[1]: https://poppler.freedesktop.org/
[2]: https://pdfbox.apache.org/
