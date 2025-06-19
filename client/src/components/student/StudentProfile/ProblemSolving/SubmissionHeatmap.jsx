import CalendarHeatmap from 'react-calendar-heatmap';


export default function SubmissionHeatmap({ submissions }) {
    if (!submissions || submissions.length === 0) {
        return <p className="text-muted-foreground">No submissions in this period.</p>;
    }

    const submissionData = submissions.map(s => ({
        date: new Date(s.creationTimeSeconds * 1000),
        count: 1
    }));

    const aggregatedData = submissionData.reduce((acc, curr) => {
        const date = curr.date.toISOString().split('T')[0];
        const existing = acc.find(item => item.date === date);
        if (existing) {
            existing.count += 1;
        } else {
            acc.push({ date, count: 1 });
        }
        return acc;
    }, []);

    return (
        <CalendarHeatmap
            startDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1))}
            endDate={new Date()}
            values={aggregatedData}
            classForValue={(value) => {
                if (!value) {
                    return 'color-empty';
                }
                return `color-scale-${Math.min(value.count, 4)}`;
            }}
        />
    );
}
