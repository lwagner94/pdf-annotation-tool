# Backend API documentation


`/api/documents`:
  - `GET`: Get all documents
  - `POST`: Upload new document
 
`/api/documents/<document_id>`
  - `GET`: Fetch document with id
  - `DELETE`: Delete document
  
`/api/annotationsets`:
  - `GET`: Get all annotation sets
  - `POST`: Create new annotation set

`/api/annotationsets/<set_id>`:
  - `GET`: Get annotation set
  - `PUT`: Update existing annotation set
  - `DELETE`: Delete annotation set 
  
`/api/annotationsets/<set_id>/annotations`
  - `GET`: Get all annotations for set
  - `POST`: Create new annotation

`/api/annotationsets/<set_id>/annotations/<annotation_id>`
  - `GET`: Get annotation by id
  - `PUT`: Update annotation
  - `DELETE`: Delete annotation