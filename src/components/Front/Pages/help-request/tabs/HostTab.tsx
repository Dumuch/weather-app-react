import { Accordion, AccordionTab } from 'primereact/accordion';
import { FC } from 'react';
import { HelpQuestion } from '../../../../../models/api/helpCenter';

interface Props {
    questions: HelpQuestion[];
}

const HostTab: FC<Props> = ({ questions }) => {
    return (
        <>
            <Accordion multiple>
                {questions.map((question) => (
                    <AccordionTab key={question.id} header={question.question}>
                        <div dangerouslySetInnerHTML={{ __html: question.answer }} />
                    </AccordionTab>
                ))}
            </Accordion>
        </>
    );
};

export default HostTab;
