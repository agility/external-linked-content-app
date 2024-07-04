/* eslint-disable @next/next/no-img-element */
"use client"

import EmptySection from "@/components/EmptySection"
import useItemDetails from "@/hooks/useItemDetails"

import {LinkedItem} from "@/types/LinkedItem"
import {SelectedValue} from "@/types/SelectedValue"
import {useAgilityAppSDK, contentItemMethods, openModal, useResizeHeight, getManagementAPIToken} from "@agility/app-sdk"
import {Button, ButtonDropdown, DynamicIcon} from "@agility/plenum-ui"
import {IconEdit} from "@tabler/icons-react"
import {useCallback, useEffect, useState} from "react"

export default function LinkedEventField() {
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
									<div className="text-base font-medium">Selected Item</div>
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

							<div className="flex py-2 gap-2 mt-5 border-b border-b-gray-200 ">
								<div className="text-gray-500">Content ID</div>
								<div className="">{selectedItem.item.itemContainerID}</div>
							</div>

							{isLoading && <div>Loading...</div>}
							{error && <div>Error loading item detail</div>}

							{itemDetail && (
								<>
									<div className=" flex gap-2 py-2 border-b border-b-gray-200">
										<div className="text-gray-500">Stock</div>
										<div className="flex gap-1 items-center">VersionID: {itemDetail.properties.versionID}</div>
									</div>

									<div className=" flex justify-between py-2 border-b border-b-gray-200 ">
										<div className="text-gray-500">Price</div>
										<div className="">
											<textarea value={JSON.stringify(itemDetail)}></textarea>
										</div>
									</div>
								</>
							)}
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
