import React from 'react';

interface PreviewPageProps {
    data: any[]; // Expecting data to be passed as a prop
    fileName: string;
}

const PreviewPage: React.FC<PreviewPageProps> = ({ data, fileName }) => {
    return (
        <div>
            <h1>Preview of {fileName}</h1>
            {data.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            {Object.keys(data[0]).map((key) => (
                                <th key={key}>{key}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, index) => (
                            <tr key={index}>
                                {Object.values(row).map((value, i) => (
                                    <td key={i}>{value}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No data available for preview.</p>
            )}
        </div>
    );
};

export default PreviewPage;