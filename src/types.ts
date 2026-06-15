/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UploadedImage {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string;
  timestamp: number;
  width?: number;
  height?: number;
}
