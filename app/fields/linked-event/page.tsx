/* eslint-disable @next/next/no-img-element */
"use client"

import EmptySection from "@/components/EmptySection"
import useItemDetails from "@/hooks/useItemDetails"
import useModel from "@/hooks/useModel"
import {defaultColumns} from "@/lib/DefaultColumns"

import {SelectedValue} from "@/types/SelectedValue"
import {useAgilityAppSDK, contentItemMethods, openModal, useResizeHeight, getManagementAPIToken} from "@agility/app-sdk"
import {Button, ButtonDropdown, DynamicIcon} from "@agility/plenum-ui"
import {IconEdit} from "@tabler/icons-react"
import {useCallback, useEffect, useMemo, useState} from "react"

export default function LinkedEvent() {
	const {initializing, field, fieldValue} = useAgilityAppSDK()

	const [token, setToken] = useState<string | null>(null)

	const containerRef = useResizeHeight()

	const [selectedItem, onsetSelectedItem] = useState<SelectedValue | null | undefined>(null)

	/**
	 * Fetch the full item details of the selected item (if any)
	 */
	const {itemDetail, isLoading, error} = useItemDetails({
		token,
		contentID: selectedItem?.item?.itemContainerID || 0,
		guid: selectedItem?.guid || "",
		locale: selectedItem?.locale || "",
	})

	/**
	 * Fetch the model of the selected item (if any)
	 */
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

	/**
	 * Show the modal to choose the selected item
	 */
	const selectContentItem = useCallback(() => {
		const props = {
			token: token,
			guid: selectedItem?.guid || "7d3a5b28-u",
			locale: selectedItem?.locale || "en-us",
			referenceName: selectedItem?.referenceName || "Events",
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
		//initialize the field value of the selected item (parse out the JSON)
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

	/**
	 * If this item has an image attachment, pull that out to show on the item detail.
	 */
	const imageUrl = useMemo(() => {
		if (!itemDetail || !model) return null

		const imageField = model.fields.find((f) => f.type === "ImageAttachment")
		const fieldNames = Object.keys(itemDetail?.fields || {})
		const fieldName = fieldNames.find((f) => f.toLowerCase() === imageField?.name?.toLowerCase())
		if (!imageField || !fieldName) return null
		const img = itemDetail?.fields[fieldName]

		if (img && img.url) {
			if (img.url.includes(".svg")) {
				return img.url
			}
			return `${img.url}?w=250&format=auto`
		}
	}, [model, itemDetail])

	/**
	 * Show the fields of the selected item, pull the field labels from the actual model if possible.
	 */
	const displayFields = useMemo(() => {
		const fieldNames = Object.keys(selectedItem?.item || {}).filter((fieldName) => {
			return !defaultColumns.includes(fieldName.toLowerCase())
		})
		return fieldNames.map((fieldName) => {
			const field = model?.fields.find((f) => f.name?.toLowerCase() === fieldName.toLowerCase())

			const label = field?.label || fieldName
			let value = selectedItem?.item[fieldName] || ""

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
						<div className="p-2 flex items-center bg-gray-200">
							{imageUrl && <img src={imageUrl} className="" alt="" />}
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

							{/* show the field values
							 - if you KNOW what kind of item you want to pick, you can hard code the fields here
							 */}

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
