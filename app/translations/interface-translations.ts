export const galleryEditorMessages = {
  en: {
    useAtMost600Photos: 'Use at most 600 photos.',
    addPhotosToTheAlbum: 'Add photos to the album',
    selectOneOrMoreImagesThenFillTheEnglish:
      'Select one or more images. Then fill the English and Spanish caption and image description before publishing.',
    findAPhoto: 'Find a photo',
    photo: 'Photo',
    photoDetails: 'Photo details',
    removeThisPhotoFromTheDraft: 'Remove this photo from the draft?',
    removePhoto: 'Remove photo',
    moveEarlier: 'Move earlier',
    replaceThisPhoto: 'Replace this photo',
  },
  es: {
    useAtMost600Photos: 'Usa hasta 600 fotos.',
    addPhotosToTheAlbum: 'Añadir fotos al álbum',
    selectOneOrMoreImagesThenFillTheEnglish:
      'Selecciona una o más imágenes. Después completa el pie de foto y la descripción en inglés y español antes de publicar.',
    findAPhoto: 'Buscar una foto',
    photo: 'Foto',
    photoDetails: 'Detalles de la foto',
    removeThisPhotoFromTheDraft: '¿Eliminar esta foto del borrador?',
    removePhoto: 'Eliminar foto',
    moveEarlier: 'Mover antes',
    replaceThisPhoto: 'Reemplazar esta foto',
  },
} as const;

export const imageFieldsMessages = {
  en: {
    photosDescribeReorderOrReplace: 'Photos · describe, reorder or replace',
    replaceThisPhoto: 'Replace this photo',
    describeWhatIsShownForPeopleUsingScreenReaders:
      'Describe what is shown, for people using screen readers. Both languages are required.',
    english: 'English',
    caption: 'Caption',
    remove: 'Remove',
    moveEarlier: 'Move earlier',
  },
  es: {
    photosDescribeReorderOrReplace: 'Fotos · describe, ordena o reemplaza',
    replaceThisPhoto: 'Reemplazar esta foto',
    describeWhatIsShownForPeopleUsingScreenReaders:
      'Describe qué aparece en la foto para quienes usan lectores de pantalla. Ambos idiomas son obligatorios.',
    english: 'Español',
    caption: 'Pie de foto',
    remove: 'Eliminar',
    moveEarlier: 'Mover antes',
  },
} as const;

export const panelMessages = {
  en: {
    contentCollections: 'Content collections',
    publishingSteps: 'Publishing steps',
    editContentPhotos: 'Edit content & photos',
    savePreviewPrivately: 'Save & preview privately',
    publishToTheWebsite: 'Publish to the website',
    submissionReviewedAcceptedPhotosAreSavedInThePrivate:
      'Submission reviewed. Accepted photos are saved in the private draft; review captions and publish when ready.',
  },
  es: {
    contentCollections: 'Colecciones de contenido',
    publishingSteps: 'Pasos para publicar',
    editContentPhotos: 'Edita textos y fotos',
    savePreviewPrivately: 'Guarda y revisa en privado',
    publishToTheWebsite: 'Publica en la web',
    submissionReviewedAcceptedPhotosAreSavedInThePrivate:
      'Envío revisado. Las fotos aceptadas están guardadas en el borrador privado; revisa los textos y publica cuando estén listas.',
  },
} as const;

export const photoInboxMessages = {
  en: {
    rejectThisSubmissionItsPhotosWillRemainPrivate:
      'Reject this submission? Its photos will remain private.',
    photosFromTheFamilia: 'Photos from the familia',
    refreshInbox: 'Refresh inbox',
    step1ReviewPermissionAndCaptions2AddABatch:
      '1. Review permission and captions. 2. Add a batch to the draft. 3. Review EN / ES in Photo details, then publish. Pending photos stay private.',
    saveYourFirstGalleryDraftToEnableAcceptance:
      'Save your first gallery draft to enable acceptance.',
    saveUnsavedChangesBeforeReviewingASubmission:
      'Save unsaved changes before reviewing a submission.',
    openUpgradeSQL: 'Open upgrade SQL',
    allCaughtUpNoPhotosWaitingForReview: 'All caught up. No photos waiting for review.',
    theSenderConfirmedPermissionToShareAndPublishThese:
      'The sender confirmed permission to share and publish these images.',
    addToGalleryDraft: 'Add to gallery draft',
    reject: 'Reject',
  },
  es: {
    rejectThisSubmissionItsPhotosWillRemainPrivate:
      '¿Rechazar este envío? Sus fotos seguirán privadas.',
    photosFromTheFamilia: 'Fotos de la familia',
    refreshInbox: 'Actualizar bandeja',
    step1ReviewPermissionAndCaptions2AddABatch:
      '1. Revisa el permiso y los textos. 2. Añade el envío al borrador. 3. Revisa EN / ES en Detalles de la foto y publica. Las fotos pendientes siguen privadas.',
    saveYourFirstGalleryDraftToEnableAcceptance:
      'Guarda el primer borrador de la fototeca para aceptar fotos.',
    saveUnsavedChangesBeforeReviewingASubmission:
      'Guarda los cambios antes de revisar un envío.',
    openUpgradeSQL: 'Abrir SQL de actualización',
    allCaughtUpNoPhotosWaitingForReview: 'Todo al día. No hay fotos esperando revisión.',
    theSenderConfirmedPermissionToShareAndPublishThese:
      'La persona confirmó tener permiso para compartir y publicar estas imágenes.',
    addToGalleryDraft: 'Añadir al borrador',
    reject: 'Rechazar',
  },
} as const;

export const addToCalendarMessages = {
  en: {
    calendarDownloadUnavailableCancelled: 'Calendar download unavailable · cancelled',
    addToCalendar: 'Add to calendar',
  },
  es: {
    calendarDownloadUnavailableCancelled:
      'Descarga de calendario no disponible · cancelado',
    addToCalendar: 'Añadir al calendario',
  },
} as const;

export const eventCountdownMessages = {
  en: {
    loadingTheCountdown: 'Loading the countdown…',
    thisEventHasEnded: 'This event has ended.',
    theFiestaHasStarted: 'The fiesta has started!',
    theFiestaStartsIn: 'The fiesta starts in',
    days: 'days',
  },
  es: {
    loadingTheCountdown: 'Cargando la cuenta regresiva…',
    thisEventHasEnded: 'Este evento ha terminado.',
    theFiestaHasStarted: '¡La fiesta ha comenzado!',
    theFiestaStartsIn: 'La fiesta comienza en',
    days: 'días',
  },
} as const;

export const eventDetailMessages = {
  en: {
    activityDetails: 'Activity details',
    hoursNotPublishedCheckWithTheOrganizer:
      'Hours not published · check with the organizer.',
    publishedSchedule: 'Published schedule',
    endTimeNotPublished: 'End time not published.',
  },
  es: {
    activityDetails: 'Detalles de la actividad',
    hoursNotPublishedCheckWithTheOrganizer:
      'Horario no publicado · consulta al organizador.',
    publishedSchedule: 'Programa publicado',
    endTimeNotPublished: 'Hora de cierre no publicada.',
  },
} as const;

export const homeGlobePreviewMessages = {
  en: {
    dragTheGlobeMakeItYours: 'Drag the globe · make it yours',
    discover: 'Discover',
  },
  es: {
    dragTheGlobeMakeItYours: 'Arrastra el globo · hazlo tuyo',
    discover: 'Descubrir',
  },
} as const;

export const motionControlMessages = {
  en: {
    animations: 'Animations',
  },
  es: {
    animations: 'Animaciones',
  },
} as const;

export const niagaraDirectoryMessages = {
  en: {
    tryPupusasBakeryWelland: 'Try pupusas, bakery, Welland…',
    exploreTheMap: 'Explore the map',
    businessDirectory: 'Business directory',
  },
  es: {
    tryPupusasBakeryWelland: 'Prueba pupusas, panadería, Welland…',
    exploreTheMap: 'Explora el mapa',
    businessDirectory: 'Directorio de negocios',
  },
} as const;

export const niagaraMapMessages = {
  en: {
    niagaraBusinessMap: 'Niagara business map',
  },
  es: {
    niagaraBusinessMap: 'Mapa de negocios de Niagara',
  },
} as const;

export const siteShellMessages = {
  en: {
    nCLatinClubHome: 'NC Latin Club — Home',
    mainNavigation: 'Main navigation',
    espaOl: 'Español',
  },
  es: {
    nCLatinClubHome: 'NC Latin Club — Inicio',
    mainNavigation: 'Navegación principal',
    espaOl: 'English',
  },
} as const;

export const notFoundMessages = {
  en: {
    aDifferentPath: 'A different path.',
    weCouldnTFindThatPageComeBackTo:
      'We couldn’t find that page. Come back to the agenda and discover what’s happening.',
    exploreTheAgenda: 'Explore the agenda',
  },
  es: {
    aDifferentPath: 'Otro camino.',
    weCouldnTFindThatPageComeBackTo:
      'No encontramos esa página. Vuelve a la agenda y descubre qué está pasando.',
    exploreTheAgenda: 'Explora la agenda',
  },
} as const;
