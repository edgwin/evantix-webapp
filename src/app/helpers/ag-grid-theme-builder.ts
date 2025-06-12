import { themeQuartz } from 'ag-grid-community';

// to use myTheme in an application, pass it to the theme grid option
export const myTheme = themeQuartz
	.withParams({
        borderColor: "#21202026",
        browserColorScheme: "light",
        headerBackgroundColor: "#AFAFAF",
        headerFontSize: 16,
        headerRowBorder: false,
        headerVerticalPaddingScale: 0.5,
        rowBorder: false,
        rowVerticalPaddingScale: 10,
        spacing: 50,
        wrapperBorder: false
    });
