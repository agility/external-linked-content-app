/* eslint-disable @next/next/no-img-element */
"use client"

import EmptySection from "@/components/EmptySection"
import useItemDetails from "@/hooks/useItemDetails"
import useModel from "@/hooks/useModel"
import {defaultColumns} from "@/lib/DefaultColumns"

import {LinkedItem} from "@/types/LinkedItem"
import {SelectedValue} from "@/types/SelectedValue"
import {useAgilityAppSDK, contentItemMethods, openModal, useResizeHeight, getManagementAPIToken} from "@agility/app-sdk"
import {Button, ButtonDropdown, DynamicIcon} from "@agility/plenum-ui"
import {IconEdit} from "@tabler/icons-react"
import {useCallback, useEffect, useMemo, useState} from "react"

export default function ExternalContentField() {
	const {initializing, field, fieldValue} = useAgilityAppSDK()

	const [token, setToken] = useState<string | null>(null)

	const containerRef = useResizeHeight()

	const [selectedItem, onsetSelectedItem] = useState<SelectedValue | null | undefined>(null)

	const {itemDetail, isLoading, error} = useItemDetails({
		token,
		contentID: selectedItem?.item?.itemContainerID || 0,
		guid: selectedItem?.guid || "",
		locale: selectedItem?.locale || "",
	})

	const {
		data: model,
		isLoading: loadingModel,
		error: modelError,
	} = useModel({token, guid: selectedItem?.guid, referenceName: itemDetail?.properties.definitionName})

	const setSelectedItem = useCallback(
		(item: SelectedValue | null | undefined) => {
			const itemJSON = item ? JSON.stringify(item) : ""
			contentItemMethods.setFieldValue({name: field?.name, value: itemJSON})
			onsetSelectedItem(item)
		},
		[field?.name]
	)

	useEffect(() => {
		console.log("selectedItem", selectedItem)
		console.log("item Detail", itemDetail)
	}, [selectedItem, fieldValue, itemDetail])

	const selectContentItem = useCallback(() => {
		const props = {
			token: token,
			guid: selectedItem?.guid || "",
			locale: selectedItem?.locale || "",
			referenceName: selectedItem?.referenceName || "",
		}

		openModal<SelectedValue | null>({
			title: "Select an Item",
			name: "agility-item-selector",
			props,
			callback: (item) => {
				if (item) setSelectedItem(item)
			},
		})
	}, [selectedItem?.guid, selectedItem?.locale, selectedItem?.referenceName, setSelectedItem, token])

	useEffect(() => {
		//get the mgmt api token

		if (initializing) return

		getManagementAPIToken()
			?.then((token: string) => {
				setToken(token)
			})
			.catch((err: any) => {
				console.error("Error getting mgmt api token:", err)
			})
	}, [initializing])

	useEffect(() => {
		//initialize the field value of the product
		if (!fieldValue) {
			onsetSelectedItem(null)
			return
		}

		let savedValue: any | null = null

		try {
			savedValue = JSON.parse(fieldValue)

			if (savedValue?.item?.itemContainerID === undefined) {
				savedValue = null
			}
		} catch (e) {
			console.warn("Error parsing item JSON.", e)
		}

		onsetSelectedItem(savedValue)
	}, [fieldValue])

	useEffect(() => {
		//load the product details if we have a product
		if (!selectedItem) return
	}, [selectedItem])

	const image = useMemo(() => {
		if (!itemDetail || !model) return null

		const imageField = model.fields.find((f) => f.type === "Image")
		if (!imageField) return null
		const img = itemDetail?.fields[imageField.name || ""]
		console.log("imageField", imageField)
		console.log("img", img)
		return img
	}, [model, itemDetail])

	const displayFields = useMemo(() => {
		const fieldNames = Object.keys(selectedItem?.item || {}).filter((fieldName) => {
			return !defaultColumns.includes(fieldName.toLowerCase())
		})
		return fieldNames.map((fieldName) => {
			const field = model?.fields.find((f) => f.name?.toLowerCase() === fieldName.toLowerCase())

			const label = field?.label || fieldName
			let value = selectedItem?.item[fieldName] || ""

			// if (field?.type === "") {

			// }

			return {
				label,
				value,
			}
		})
	}, [model, selectedItem])

	if (initializing) return null

	return (
		<div ref={containerRef} id="external-item-field">
			<div className="p-[1px]">
				{selectedItem && (
					<div className="flex border border-gray-200 rounded gap-2">
						<div className="rounded-l shrink-0">
							{/* <img src={selectedItem.image?.detailUrl} className="h-60 rounded-l" alt={selectedItem.name} /> */}
						</div>
						<div className="flex-1 flex-col p-2 ">
							<div className="flex gap-2 justify-between items-center">
								<div className="flex gap-2 items-center">
									<div className="text-base font-medium">{model?.displayName || "Selected Item"}</div>
									<div>ID: {selectedItem.item.itemContainerID}</div>
									<div className="text-sm text-gray-500">
										{isLoading ? (
											<DynamicIcon icon="FaSpinner" className="animate-spin" />
										) : error ? (
											<div title="Error loading the item.">
												<DynamicIcon icon="IconExclamationCircle" className="text-red-600 h-5 w-5" />
											</div>
										) : (
											<div className="text-xs bg-gray-100 px-2 py-1 rounded-md">{selectedItem.item.state}</div>
										)}
									</div>
								</div>
								<div className="flex gap-1 items-center">
									<Button
										actionType="alternative"
										onClick={() => selectContentItem()}
										label="Browse"
										icon="IconLayoutGrid"
									/>

									<Button
										actionType="alternative"
										asLink={{
											href: `https://app.agilitycms.com/instance/${selectedItem.guid}/${selectedItem.locale}/content/listitem-${selectedItem.item.itemContainerID}`,
											target: "_blank",
										}}
										label="View"
										icon="IconExternalLink"
									/>

									<Button
										actionType="alternative"
										onClick={() => setSelectedItem(null)}
										label=""
										icon="IconTrash"
										title="Remove"
									/>
								</div>
							</div>

							{/* show the field values */}
							{displayFields.map((field) => (
								<div key={field.label} className=" flex gap-2 py-2 border-b border-b-gray-200">
									<div className="text-gray-500 w-40 truncate">{field.label}</div>
									<div className="flex gap-1 items-center">{field.value}</div>
								</div>
							))}
						</div>
					</div>
				)}

				{!selectedItem && (
					<EmptySection
						icon={<IconEdit className="text-gray-400 h-12 w-12" stroke={1} />}
						messageHeading="No Item Selected"
						messageBody="Select a content item to link it to this item."
						buttonComponent={
							<Button
								actionType="alternative"
								onClick={() => selectContentItem()}
								label="Browse"
								icon="IconLayoutGrid"
							/>
						}
					/>
				)}
			</div>
		</div>
	)
}
