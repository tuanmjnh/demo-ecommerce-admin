import { httpAxiosLoading } from '@/services'
const API_PATH = '/cloudinary'
export const useCloudinaryStore = defineStore('cloudinaryStore', () => {
  /** ------------------ STATE (ref) ------------------ **/
  // The original store had an empty state, so no reactive variables are defined here.

  /** ------------------ GETTERS (computed) ------------------ **/
  // The original store had empty getters, so none are defined here.

  /** ------------------ ACTIONS ------------------ **/

  /**
   * Fetches a security signature for client-side uploads to Cloudinary.
   * @param args - Optional parameters including the target folder.
   * @returns A response containing the signature details.
   */
  const getSignature = async (args?: { folder?: string }): Promise<Cloudinary.IResponseSignature> => {
    try {
      const rs = await httpAxiosLoading.get<Cloudinary.IResponseSignature>(`${API_PATH}/signature`, args)
      return rs
    } catch (e) { throw e }
  }

  /**
   * Creates a new folder in Cloudinary.
   * @param args - Folder creation parameters (e.g., folder path).
   * @returns True if the folder was created successfully.
   */
  const createFolder = async (args?: any): Promise<boolean> => {
    try {
      const rs = await httpAxiosLoading.post<boolean>(`${API_PATH}/folders`, args)
      return rs
    } catch (e) { throw e }
  }

  /**
   * Retrieves a list of folders within a parent directory.
   * @param args - Parameters for folder retrieval (e.g., parent path).
   * @returns An object containing the parent path and the list of folders.
   */
  const getFolders = async (args?: any): Promise<{ parent: string, folders: Cloudinary.IFolder[] }> => {
    try {
      const rs = await httpAxiosLoading.get<Cloudinary.IResponseFolders>(`${API_PATH}/folders`, args)
      return rs
    } catch (e) { throw e }
  }

  /**
   * Deletes a folder from Cloudinary.
   * @param args - Folder deletion parameters (e.g., folder path).
   * @returns True if the folder was deleted successfully.
   */
  const deleteFolder = async (args?: any): Promise<boolean> => {
    try {
      const rs = await httpAxiosLoading.delete<boolean>(`${API_PATH}/folders/${args}`)
      return rs
    } catch (e) { throw e }
  }

  /**
   * Retrieves a list of files (assets) from Cloudinary.
   * @param args - Parameters for file retrieval.
   * @returns A response object containing asset details.
   */
  const getFiles = async (args?: any): Promise<Cloudinary.IResponseAsset> => {
    try {
      const rs = await httpAxiosLoading.get<Cloudinary.IResponseAsset>(`${API_PATH}/files`, args)
      return rs
    } catch (e) { throw e }
  }

  /**
   * Renames a file (asset) in Cloudinary.
   * @param args - Parameters including the file's public ID and new name.
   * @returns True if the file was renamed successfully.
   */
  const renameFile = async (args?: any): Promise<boolean> => {
    try {
      const rs = await httpAxiosLoading.put<boolean>(`${API_PATH}/files/rename`, args)
      return rs
    } catch (e) { throw e }
  }

  /**
   * Deletes a file (asset) from Cloudinary.
   * @param args - Parameters including the public ID of the file to delete.
   * @returns True if the file was deleted successfully.
   */
  const deleteFile = async (args?: any): Promise<boolean> => {
    try {
      const rs = await httpAxiosLoading.delete<boolean>(`${API_PATH}/files/${args}`)
      return rs
    } catch (e) { throw e }
  }

  /** * Function to clear/reset the store's state (equivalent to $reset).
   * Since there is no state defined currently, this function is a placeholder.
   */
  const resetStore = () => {
    // If state variables were added later (e.g., const assets = ref([])),
    // they would be reset here (e.g., assets.value = []).
  }

  /** ------------------ RETURN EXPORT ------------------ **/
  return {
    // actions
    getSignature,
    createFolder,
    getFolders,
    deleteFolder,
    getFiles,
    renameFile,
    deleteFile,
    resetStore,
  }
}, { persist: false })
