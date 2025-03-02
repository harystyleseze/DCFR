import { createAutoDriveApi, apiCalls, Scope, fs } from "@autonomys/auto-drive";

export class AutoDriveService {
  private api;

  constructor(apiKey: string) {
    this.api = createAutoDriveApi({
      apiKey,
      network: "taurus",
    });
  }

  async uploadFile(file: File, onProgress?: (progress: number) => void) {
    try {
      const cid = await this.api.uploadFileFromInput(file, {
        compression: true,
        onProgress: (progress: number) => {
          console.log(`Upload is ${progress}% completed`);
          onProgress?.(progress);
        },
      });

      console.log(`File uploaded with CID: ${cid}`);
      return { cid };
    } catch (error: any) {
      console.error("Error uploading file:", error);
      throw new Error(`Error uploading file: ${error.message}`);
    }
  }

  async getFileMetadata(cid: string) {
    try {
      const objectInfo = await apiCalls.getObject(this.api, { cid });
      return {
        name: objectInfo.metadata.name,
        totalSize: objectInfo.metadata.totalSize,
        type: objectInfo.metadata.type,
        compression: objectInfo.metadata.uploadOptions?.compression,
        encryption: objectInfo.metadata.uploadOptions?.encryption,
      };
    } catch (error: any) {
      console.error("Error getting file metadata:", error);
      throw new Error(`Error getting file metadata: ${error.message}`);
    }
  }

  async getFiles(limit = 100, offset = 0) {
    try {
      const { totalCount, rows } = await apiCalls.getRoots(this.api, {
        scope: Scope.User,
        limit,
        offset,
      });

      return {
        totalCount,
        files: rows.map(({ name, headCid, size }) => ({
          name,
          cid: headCid,
          size,
        })),
      };
    } catch (error: any) {
      console.error("Error getting files:", error);
      throw new Error(`Error getting files: ${error.message}`);
    }
  }

  getPublicUrl(cid: string) {
    try {
      return apiCalls.publicDownloadUrl(this.api, cid);
    } catch (error: any) {
      console.error("Error generating public URL:", error);
      throw new Error(`Error generating public URL: ${error.message}`);
    }
  }

  async shareFile(cid: string, publicId: string) {
    try {
      const result = await apiCalls.shareObject(this.api, { cid, publicId });
      return result;
    } catch (error: any) {
      console.error("Error sharing file:", error);
      throw new Error(`Error sharing file: ${error.message}`);
    }
  }

  async deleteFile(cid: string) {
    try {
      await apiCalls.markObjectAsDeleted(this.api, { cid });
      return true;
    } catch (error: any) {
      console.error("Error deleting file:", error);
      throw new Error(`Error deleting file: ${error.message}`);
    }
  }

  async searchFile(value: string) {
    try {
      const results = await apiCalls.searchByNameOrCID(this.api, {
        value,
        scope: Scope.User,
      });
      return results.map(({ name, cid }) => ({ name, cid }));
    } catch (error: any) {
      console.error("Error searching files:", error);
      throw new Error(`Error searching files: ${error.message}`);
    }
  }

  async uploadFolder(
    folder: FileList,
    onProgress?: (progress: number) => void
  ) {
    try {
      const options = {
        compression: true,
        uploadChunkSize: 1024 * 1024, // 1MB chunks
        onProgress: (progress: number) => {
          console.log(`Upload is ${progress}% completed`);
          onProgress?.(progress);
        },
      };

      // Start folder upload session
      const folderCID = await this.api.uploadFolderFromInput(folder, options);
      console.log("Folder upload completed with CID:", folderCID);

      return {
        cid: folderCID,
        name: folder[0]?.webkitRelativePath?.split("/")[0] || "Uploaded Folder",
      };
    } catch (error: any) {
      console.error("Error uploading folder:", error);
      throw new Error(`Error uploading folder: ${error.message}`);
    }
  }

  async downloadFile(cid: string) {
    try {
      const stream = await this.api.downloadFile(cid);
      return stream;
    } catch (error: any) {
      console.error("Error downloading file:", error);
      throw new Error(`Error downloading file: ${error.message}`);
    }
  }
}
