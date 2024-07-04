/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */

import {Container, ContentItem} from "@agility/management-sdk"
import {Checkbox} from "@agility/plenum-ui"
import {IconBan, IconCheck} from "@tabler/icons-react"
import classNames from "classnames"

interface Props {
	item: any
	container: Container
	onSelect: (item: any) => void
}

export default function ItemRow({item, container, onSelect}: Props) {
	const keys = Object.keys(item)
	return (
		<tr rel="button" className="hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => onSelect(item)}>
			{container.columns.map((column, index) => {
				const propName = keys.find((k) => k.toLowerCase() === (column.fieldName?.toLowerCase() || ""))
				const val = `${item[propName || ""]}`

				return (
					<td
						key={`${item.itemContainerID}-${column.fieldName}`}
						className="whitespace-nowrap px-3 py-4 text-sm text-gray-500  "
					>
						<div className="max-w-[300px] truncate">{val}</div>
					</td>
				)
			})}

			{/* <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{person.name}</td>

			<td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.email}</td>
			<td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.role}</td> */}
			<td className="">
				<a href="#" className="text-indigo-600 hover:text-indigo-900 sr-only">
					Select
				</a>
			</td>
		</tr>
	)
}
