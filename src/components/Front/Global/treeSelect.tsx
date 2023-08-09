import { TreeSelect, TreeSelectSelectionKeys } from 'primereact/treeselect';
import { FrontFloatLabel } from './floatLabel';
import React, { useState } from 'react';
import { FunctionComponent } from 'react';

interface ItemOptions {
    key: number;
    label: string;
    children: ItemOptions[];
}

export enum TreeSelectSelectionMode {
    multiple = 'multiple',
    single = 'single',
    checkbox = 'checkbox',
}

interface Props {
    options: ItemOptions[];
    value: TreeSelectSelectionKeys;
    name: string;
    selectionMode?: TreeSelectSelectionMode;
    handlerTreeSelect: (e: any) => void;
    label: string;
    id: string;
    readOnly?: boolean;
}

const ONE_CHARACTER_PX = 11;

const FrontTreeSelect: FunctionComponent<Props> = ({
    options,
    value,
    name,
    selectionMode = TreeSelectSelectionMode.multiple,
    handlerTreeSelect,
    label,
    id,
    readOnly = false,
}) => {
    const treeSelectLabelContainer = document.getElementById(id)
        ? document.getElementById(id)?.getElementsByClassName('p-treeselect-label')[0]
        : null;
    const [maxSymbols, setMaxSymbols] = useState(
        treeSelectLabelContainer ? Math.floor(treeSelectLabelContainer.clientWidth / ONE_CHARACTER_PX) : 0
    );

    const ro = new ResizeObserver((entries) => {
        if (treeSelectLabelContainer)
            setMaxSymbols(Math.floor(treeSelectLabelContainer?.clientWidth / ONE_CHARACTER_PX));
    });
    treeSelectLabelContainer && ro.observe(treeSelectLabelContainer);

    const valueTemplateTreeSelect = (items: any) => {
        let symbols = 0;
        let isMaxSymbols = false;

        return items.map((item: any) => {
            if (item.children.length === 0) {
                symbols = symbols + item.label.length + 1;
                if (maxSymbols > symbols + 2) {
                    isMaxSymbols = false;
                    return (
                        <span key={item.key} data-key-tree-select={item.key}>
                            {item.label}
                        </span>
                    );
                } else {
                    if (!isMaxSymbols) {
                        isMaxSymbols = true;
                        return <span key={item.key}>...</span>;
                    }
                }
            }
        });
    };
    return (
        <FrontFloatLabel label={label} id={id}>
            <TreeSelect
                id={id}
                value={value}
                options={options}
                onChange={handlerTreeSelect}
                name={name}
                selectionMode={selectionMode}
                metaKeySelection={false}
                valueTemplate={valueTemplateTreeSelect}
                display="chip"
                disabled={readOnly}
                onNodeSelect={(e) => console.log(e)}
            />
        </FrontFloatLabel>
    );
};

export default FrontTreeSelect;
