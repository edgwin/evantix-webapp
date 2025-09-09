export class UploadHelper {
  constructor(
    private invitationService: any,
    private notificationService: any
  ) {}

triggerImageUpload(
  tableName: string,
  searchField: string,
  eventId: string,
  field: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.uploadImage(tableName, searchField, eventId, field, file)
          .then(res => resolve(res))
          .catch(err => reject(err));
      } else {
        reject(new Error('Selección cancelada')); // evita quedarse colgado
      }
    };
    input.click();
  });
}
  private uploadImage(
    tableName: string,
    searchField: string,
    eventId: string,
    field: string,
    file: File
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      this.invitationService
        .updateTableFieldImagen(tableName, searchField, eventId, field, file)
        .subscribe({
          next: (res: string) => resolve(res),
          error: (err: any) => {
            this.notificationService.show(
              'error',
              `Error al subir imagen: ${err.message}`
            );
            reject(err);
          }
        });
    });
  }
}
