/**
 * @Author: chenziyang 1501844242@qq.com
 * @Date: 2023-10-07 08:44:03
 * @LastEditors: chenziyang 1501844242@qq.com
 * @LastEditTime: 2023-10-07 08:44:03
 * @FilePath: /gdsjky-vue3/src/assets/js/excel.ts
 * @Description:用于管理有关导入导出excel方法的文件
 * @Copyright (c) 2023 by 武汉嘉测科技有限公司 鄂公网安备案42018502004838号 All Rights Reserved.
 */
import FileSaver from "file-saver";
import ExcelJS, { Worksheet, Workbook } from "exceljs";
import {
  countStringLength,
  formatDate,
  isEmptyObj,
  isNumber,
  isValidDate,
} from "./util";
import JSZip from "jszip";
/**
 * @description: 自动计算列宽（合并列（isMergeCell）的宽度不参与计算）
 * @param {any} cols
 * @param {any} rows
 */
const autoComputColWidth = (cols: any[], rows: any[]) => {
  cols = cols.map((col) => {
    if (col.isMergeCell) return col;
    let baseWidth = 1;
    let width =
      rows
        .filter((e) => !e.isMergeCell)
        .reduce((width, item) => {
          Object.keys(item).forEach((e) => {
            if (e === col.key) {
              let len = countStringLength(item[e]);
              width = len > width ? len : width;
            }
          });
          return width || countStringLength(col.header);
        }, col.width) || countStringLength(col.header);
    col.width = baseWidth + width;
    return col;
  });
  return cols;
};
export class JcExcel {
  _workbook: Workbook;
  _sheet: Worksheet;
  constructor(tableName = "sheet") {
    this._workbook = new ExcelJS.Workbook();
    this._sheet = this._workbook.addWorksheet(tableName);
  }
  // 导出excel
  async exportExcel(config: ExportExcelConfig) {
    let that = this;
    // 根据列和行自动计算列的宽度
    config.cols = autoComputColWidth(config.cols, config.rows);
    // 单元格保护
    if (config.protection && config.protection.length > 0) {
      await this._sheet.protect("10000", {
        selectLockedCells: true,
        selectUnlockedCells: true,
      });
    }
    this._sheet.columns = config.cols;
    // 行
    config.rows.forEach((item) => {
      this._sheet.addRow(item);
    });
    // 合并
    if (config.mergeCells && config.mergeCells.length > 0) {
      config.mergeCells.forEach((e) => {
        this._sheet.mergeCells(e);
      });
    }
    // 有图片
    if (config.imgs && !isEmptyObj(config.imgs)) {
      Object.keys(config.imgs).forEach((key) => {
        const imageId2 = that._workbook.addImage({
          base64: config.imgs[key],
          extension: "png",
        });
        that._sheet.addImage(imageId2, key);
      });
    }
    // 设置边框和样式
    this._sheet.eachRow((row, num) => {
      row.eachCell((e) => {
        // 所有内容居中
        this._sheet.getCell(e.address).alignment = {
          vertical: "middle",
          horizontal: "center",
        };
        // 单元格保护（不让人为修改）
        if (config.protection && config.protection.length > 0) {
          if (config.protection.indexOf(e.address) === -1) {
            this._sheet.getCell(e.address).protection = {
              locked: false,
            };
          }
        } else {
          this._sheet.getCell(e.address).protection = {
            locked: false,
          };
        }
      });
      // 不需要边框的
      if (
        config.notBorder &&
        config.notBorder.length > 0 &&
        config.notBorder.indexOf(num) !== -1
      )
        return;
      row.eachCell((e) => {
        this._sheet.getCell(e.address).border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });
    // 导出表格
    this._workbook.xlsx.writeBuffer().then((buffer) => {
      let _file = new Blob([buffer], {
        type: "application/octet-stream",
      });
      FileSaver.saveAs(_file, `${config.fileName}.xlsx`);
    });
  }
}

/**
 * @description: excel导入进来的时间字符串转换成日期
 * @param {string} str 日期字符串
 * @param {boolean} isRequired 是否必填，需要必填的时候即使传进来的是空字符串，转化之后也会变成当前时间
 * @param {*} format 要输出的格式
 */
export const strToDate = (
  str: string | object | number,
  isRequired = true,
  format: TimeFormat = "YYYY-MM-DD"
) => {
  let date: Date | string = new Date();
  try {
    // 如果读到的是日期类型，会少47秒
    if (typeof str === "object") {
      const newDate = new Date(str);
      let s = 60 - newDate.getSeconds() || 47;
      newDate.setSeconds(newDate.getSeconds() + s);
      date = newDate;
    } else if (isNumber(str)) {
      const utc_days = Math.floor(str - 25569);
      const utc_value = utc_days * 86400;
      const date_info = new Date(utc_value * 1000);
      const year = date_info.getUTCFullYear();
      const month = String(date_info.getUTCMonth() + 1).padStart(2, "0");
      const day = String(date_info.getUTCDate()).padStart(2, "0");
      date = new Date(`${year}-${month}-${day}`);
    } else {
      // 如果是有效日期类型就转化，不是的话如果是必填就返回当前时间，不是必填就返回空字符串
      if (isValidDate(str)) {
        date = new Date(str);
      } else {
        date = isRequired ? new Date() : "";
      }
    }
  } catch (error) {
    date = isRequired ? new Date() : "";
  }
  return typeof date === "object" ? formatDate(date, format) : "";
};

/**
 * 获取浮层文件位置信息（嵌入的图片没存位置信息）
 */
export const getCellImageRelations = async (zipContent: JSZip) => {
  const cellImageRelations: Record<string, string> = {};
  // 获取所有关系文件内容
  const drawingRelsPromises = Object.keys(zipContent.files)
    .filter(
      (fileName) =>
        fileName.startsWith("xl/drawings/_rels/drawing") &&
        fileName.endsWith(".xml.rels")
    )
    .map((fileName) =>
      zipContent
        .file(fileName)
        .async("string")
        .then((data) => ({ fileName, data }))
    );
  const drawingRels = await Promise.all(drawingRelsPromises);
  // 解析每个关系文件
  for (const { fileName, data } of drawingRels) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(data, "application/xml");
    const relationships = xmlDoc.getElementsByTagName("Relationship");
    for (let i = 0; i < relationships.length; i++) {
      const relationship = relationships[i];
      const id = relationship.getAttribute("Id");
      const target = relationship.getAttribute("Target");
      if (target && target.startsWith("../media/")) {
        const imageFileName = target.replace("../media/", "");
        const drawingFileName = fileName
          .replace("_rels/drawing", "drawing")
          .replace(".xml.rels", ".xml");
        const cellAddress = await findImageCell(
          zipContent,
          drawingFileName,
          id
        );
        if (cellAddress) {
          cellImageRelations[cellAddress] = `xl/media/${imageFileName}`;
        }
      }
    }
  }
  return cellImageRelations;
};

/**
 * 查找图片在表格中的位置
 */
export const findImageCell = async (
  zipContent: JSZip,
  drawingFileName: string,
  relationshipId: string
) => {
  const drawingData = await zipContent.file(drawingFileName).async("string");
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(drawingData, "application/xml");
  const twoCellAnchors = xmlDoc.getElementsByTagName("xdr:twoCellAnchor");
  for (let i = 0; i < twoCellAnchors.length; i++) {
    const twoCellAnchor = twoCellAnchors[i];
    const blip = twoCellAnchor.getElementsByTagName("a:blip")[0];
    if (blip && blip.getAttribute("r:embed") === relationshipId) {
      const fromCell = twoCellAnchor.getElementsByTagName("xdr:from")[0];
      const fromCol = fromCell.getElementsByTagName("xdr:col")[0].textContent;
      const fromRow = fromCell.getElementsByTagName("xdr:row")[0].textContent;
      // 使用正确的列解析方法
      const colAddress = getExcelColumnName(parseInt(fromCol, 10)); // 获取列地址
      const rowAddress = parseInt(fromRow, 10) + 1; // 转换为 Excel 行号

      // 返回正确的单元格地址
      return `${colAddress},${rowAddress}`;
    }
  }
  return null;
};

/**
 * 将列号转换为 Excel 列地址
 * 例如：0 -> A, 25 -> Z, 26 -> AA, 27 -> AB
 */
export const getExcelColumnName = (colNum: number) => {
  let columnName = "";
  while (colNum >= 0) {
    columnName = String.fromCharCode((colNum % 26) + 65) + columnName;
    colNum = Math.floor(colNum / 26) - 1;
  }
  return columnName;
};
