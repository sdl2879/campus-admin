// src/utils/export.js
import * as XLSX from 'xlsx'

/**
 * 导出 Excel 表格
 * @param {Array} data - 要导出的数据（对象数组）
 * @param {string} filename - 文件名（如 "学生列表"）
 * @param {Array} columns - 列配置，例如：
 *   [{ label: '姓名', prop: 'name' }, { label: '性别', prop: 'gender', formatter: (v) => v === 1 ? '男' : '女' }]
 */
export function exportExcel(data = [], filename = '导出数据', columns = []) {
    if (!data.length) {
        console.warn('导出数据为空')
        return
    }

    // 生成表头
    const headers = columns.map(col => col.label)

    // 生成行数据
    const rows = data.map(item => {
        return columns.map(col => {
            let value
            if (col.formatter) {
                value = col.formatter(item[col.prop], item)
            } else if (col.prop.includes(',')) {
                // 支持多字段组合，如 'grade,className'
                const props = col.prop.split(',')
                value = props.map(p => item[p.trim()] || '').join('/')
            } else {
                value = item[col.prop] ?? ''
            }
            return value
        })
    })

    // 创建工作表
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows])
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')

    // 下载文件
    XLSX.writeFile(workbook, `${filename}.xlsx`)
}