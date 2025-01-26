// check for table or sentence like structure in text data
export const isTableLike = (text) => {
   const delimiters = ["\t", ",", "|", ";", " "];
   let detectedDelimiter = null;

   // Split text into rows
   const rows = text.split("\n").filter((row) => row.trim() !== "");

   for (const delimiter of delimiters) {
      const splitRows = rows.map((row) => row.split(delimiter));

      // Check row consistency (most rows should have the same column count)
      const columnCounts = splitRows.map((row) => row.length);
      const mostFrequentColumnCount = columnCounts
         .sort(
            (a, b) =>
               columnCounts.filter((v) => v === a).length -
               columnCounts.filter((v) => v === b).length
         )
         .pop();

      const consistentRows = columnCounts.filter(
         (count) => count === mostFrequentColumnCount
      ).length;

      // If most rows are consistent, consider it a table
      if (consistentRows / rows.length > 0.8 && mostFrequentColumnCount > 1) {
         detectedDelimiter = delimiter;
         break;
      }
   }

   // Return true only if a delimiter is detected
   return {
      isTable: !!detectedDelimiter,
      delimiter: detectedDelimiter,
   };
};

// Format table data into 2D array
export const formatTableData = (text, delimiter) => {
    const rows = text
        .split("\n")
        .filter((row) => row.trim() !== "")
        .map((row) => row.split(delimiter).map((cell) => cell.trim()));

    return rows;
}

// Another approach to detect tables
// const isTableLike = (text) => {
//    // Check if the text contains multiple lines and has consistent delimiters like commas or tabs
//    const rows = text.split("\n").filter((row) => row.trim() !== "");
   
//    // Detect delimiters in the first row
//    const delimiters = ["\t", ",", " "]; // Common table delimiters
//    let detectedDelimiter = null;
   
//    for (const delimiter of delimiters) {
//      const firstRowColumns = rows[0].split(delimiter);
//      if (firstRowColumns.length > 1) {
//        detectedDelimiter = delimiter;
//        break;
//      }
//    }
   
//    // Validate consistency across all rows
//    const isTable = rows.every((row) =>
//      detectedDelimiter ? row.split(detectedDelimiter).length > 1 : false
//    );

//    return { isTable, delimiter: detectedDelimiter || "\t" }; // Default to '\t' if no reliable delimiter found
   
//    // Alternative approach: Check for multiple delimiters
//    // if (rows.length > 1) {
//      //   const delimiters = [",", "\t", "  "]; // Common delimiters: comma, tab, or multiple spaces
//      //   for (let delimiter of delimiters) {
//        //     const firstRowCols = rows[0].split(delimiter);
//        //     const otherRowCols = rows.slice(1).map((row) => row.split(delimiter));
//    //     if (otherRowCols.every((cols) => cols.length === firstRowCols.length)) {
//      //       return { isTable: true, delimiter };
//    //     }
//    //   }
//    // }
//    // return { isTable: false };
//  };