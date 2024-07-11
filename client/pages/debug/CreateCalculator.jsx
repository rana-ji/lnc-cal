import React, { useCallback, useEffect, useState } from "react";
import {
  EmptyState,
  Grid,
  IndexTable,
  Layout,
  LegacyCard,
  Text,
  Page,
  TextField,
  useIndexResourceState,
  Badge,
  Frame,
  Modal,
  LegacyStack,
  ChoiceList,
} from "@shopify/polaris";
import { navigate } from "raviger";
import { AddProductMajor, CashDollarMinor } from "@shopify/polaris-icons";
import { ResourcePicker } from "@shopify/app-bridge-react";
import { saveCalculator, getPricing, getPapers } from "../../helpers/calculator";
import useFetch from "../../hooks/useFetch";

const CreateCalculator = () => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("");
  const [pageDisabled, setPageDisabled] = useState(true);
  const [priceModal, setPriceModal] = useState(false);
  const [paperModal, setPaperModal] = useState(false);
  const [calculator, setcalculator] = useState();
  const [pricing, setPricing] = useState([]);
  const [papers, setPapers] = useState([]);
  const [selectedPrice, setSelectedPrice] = useState([]);
  const [selectedPaper, setSelectedPaper] = useState([]);
  const [pricingList, setPricingList] = useState([]);
  const [papersList, setPapersList] = useState([]);
  const [saveLoader, setSaveLoader] = useState(false);
  const [minWidth, setMinWidth] = useState(0);
  const [maxWidth, setMaxWidth] = useState(0);
  const [minHeight, setMinHeight] = useState(0);
  const [maxHeight, setMaxHeight] = useState(0);

  const fetch = useFetch();
  const handleChange = useCallback((newValue) => {
      let tempTag = "cal-"+newValue.toLowerCase().replaceAll(" ", "-");
      setcalculator((prev) => ({
          ...prev,
          title: newValue,
          tag: tempTag,
      }));
      setPageDisabled(false);
      setTitle(newValue);
      setTag(tempTag);
  }, []);
  const handleChangeMinWidth = useCallback((newValue) => {
    setMinWidth(newValue);
    setcalculator((prev) => ({ minWidth: newValue, ...prev }));
  }, []);
  const handleChangeMaxWidth = useCallback((newValue) => {
    setMaxWidth(newValue);
    setcalculator((prev) => ({ maxWidth: newValue, ...prev }));
  }, []);
  const handleChangeMinHeight = useCallback((newValue) => {
    setMinHeight(newValue);
    setcalculator((prev) => ({ minHeight: newValue, ...prev }));
  }, []);
  const handleChangeMaxHeight = useCallback((newValue) => {
    setMaxHeight(newValue);
    setcalculator((prev) => ({ maxHeight: newValue, ...prev }));
  }, []);
  const handleSelectedPrice = useCallback((newValue) => {
    setSelectedPrice(newValue);
    setcalculator((prev) => ({ price: newValue[0].id, ...prev }));
  }, []);
  const handleSelectedPaper = useCallback((newValue) => {
    setSelectedPaper(newValue);
    setcalculator((prev) => ({ paper: newValue[0].id, ...prev }));
  }, []);
  const pricingResourceName = {
    singular: "Pricing",
    plural: "Pricings",
  };
  const paperResourceName = {
    singular: "Paper",
    plural: "Papers",
  };
  const actions = [
    {
      content: "Remove Products",
      onAction: () => console.log("Delete the foloowing"),
    },
  ];
  const {
    selectedResources: pricingSelectedResoucrce,
    allResourcesSelected: pricingAllResourcesSelected,
    handleSelectionChange: handlePriceSelectionChange,
  } = useIndexResourceState(pricing);
  const {
    selectedResources: paperSelectedResoucrce,
    allResourcesSelected: paperAllResourcesSelected,
    handleSelectionChange: handlePaperSelectionChange,
  } = useIndexResourceState(papers);
  const pricingMarkup = pricing.map(({ title, id, pricing }, ind) => (
    <IndexTable.Row
      id={id}
      key={id}
      selected={pricingSelectedResoucrce.includes(id)}
      position={ind}
    >
      <IndexTable.Cell>
        <Text variant="bodyMd" fontWeight="bold" as="span">
          {title}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text variant="bodyMd" as="span">
          {pricing.length}
        </Text>
      </IndexTable.Cell>
    </IndexTable.Row>
  ));
  const papersMarkup = papers.map(({ title, id, pricing }, ind) => (
    <IndexTable.Row
      id={id}
      key={id}
      selected={paperSelectedResoucrce.includes(id)}
      position={ind}
    >
      <IndexTable.Cell>
        <Text variant="bodyMd" fontWeight="bold" as="span">
          {title}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text variant="bodyMd" as="span">
          {pricing.length}
        </Text>
      </IndexTable.Cell>
    </IndexTable.Row>
  ));
  async function saveCalculatorContent() {
    console.log(calculator);
    setSaveLoader(true);
    await saveCalculator(
      {
        ...calculator,
        title: title,
        minWidth: minWidth,
        maxWidth: maxWidth,
        minHeight: minHeight,
        maxHeight: maxHeight,
      },
      fetch
    );
    setSaveLoader(false);
    navigate("/debug/calculators");
  }
  useEffect(() => {
    (async function getData() {
      let pricingList = await getPricing(fetch);
      pricingList = pricingList.map((price) => ({ id: price._id, ...price }));
      setPricingList(pricingList);
      let papersList = await getPapers(fetch);
      papersList = papersList.map((paper) => ({ id: paper._id, ...paper }));
      setPapersList(papersList);
    })();
  }, []);
  return (
    <Frame>
      <Page
        backAction={{
          content: "Calcualtors",
          onAction: () => {
            navigate("/debug/calculators");
          },
        }}
        primaryAction={{
          content: "Save",
          disabled: pageDisabled,
          onAction: saveCalculatorContent,
          loading: saveLoader,
        }}
      >
        <Modal
          open={priceModal}
          onClose={() => setPriceModal(false)}
          title="Choose Pricing"
          primaryAction={{
            content: "Save",
            onAction: (value) => {
              setPricing(selectedPrice);
              setPriceModal(false);
            },
          }}
        >
          <Modal.Section>
            <LegacyStack vertical>
              <LegacyStack.Item>
                {pricingList.length > 0 && (
                  <ChoiceList
                    title="Pricings"
                    choices={pricingList.map((el) => ({
                      label: el.title,
                      value: el,
                    }))}
                    onChange={handleSelectedPrice}
                    selected={selectedPrice}
                  />
                )}
                {pricingList.length == 0 && (
                  <EmptyState
                    heading="No Price Found"
                    action={{
                      content: "Create Pricing",
                      onAction: () => navigate("/debug/prices/create-price"),
                    }}
                  >
                    <p>No existing Price found please create new price</p>
                  </EmptyState>
                )}
              </LegacyStack.Item>
            </LegacyStack>
          </Modal.Section>
        </Modal>
        <Modal
          open={paperModal}
          onClose={() => setPaperModal(false)}
          title="Choose Paper Type Group"
          primaryAction={{
            content: "Save",
            onAction: (value) => {
              setPapers(selectedPaper);
              setPaperModal(false);
            },
          }}
        >
          <Modal.Section>
            <LegacyStack vertical>
              <LegacyStack.Item>
                {papersList.length > 0 && (
                  <ChoiceList
                    title="Papers"
                    choices={papersList.map((el) => ({
                      label: el.title,
                      value: el,
                    }))}
                    onChange={handleSelectedPaper}
                    selected={selectedPaper}
                  />
                )}
                {papersList.length == 0 && (
                  <EmptyState
                    heading="No Paper Type Group Found"
                    action={{
                      content: "Create Paper Type Group",
                      onAction: () => navigate("/debug/papers/create-paper"),
                    }}
                  >
                    <p>No existing Paper Type Group found please create new Paper Type Group</p>
                  </EmptyState>
                )}
              </LegacyStack.Item>
            </LegacyStack>
          </Modal.Section>
        </Modal>
        <Grid>
          <Grid.Cell columnSpan={{ xs: 12, lg: 12 }}>
            <TextField
              label="Calcualtor Name"
              autoComplete="off"
              value={title}
              onChange={handleChange}
              helpText="Please Input Calculator Title"
            />
          </Grid.Cell>
          <Grid.Cell columnSpan={{ xs: 12, lg: 12 }}>
            <TextField
              label="Calcualtor Tag"
              autoComplete="off"
              value={tag}
              readOnly
              helpText="Add this tag in the product for calculator to work"
            />
          </Grid.Cell>
          <Grid.Cell columnSpan={{ xs: 12, lg: 6 }}>
            <LegacyCard>
              {pricing.length == 0 && (
                <EmptyState
                  heading="Select Pricing Group"
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                  action={{
                    content: "Add Pricing",
                    icon: CashDollarMinor,
                    onAction: () => {
                      setPriceModal(true);
                    },
                  }}
                >
                  {/* <p>Choose pricing rule </p> */}
                </EmptyState>
              )}
              {pricing.length > 0 && (
                <IndexTable
                  resourceName={pricingResourceName}
                  itemCount={pricing.length}
                  selectedItemsCount={
                    pricingAllResourcesSelected
                      ? "All"
                      : pricingSelectedResoucrce.length
                  }
                  headings={[{ title: "Name" }, { title: "Count" }]}
                  onSelectionChange={handlePriceSelectionChange}
                  // promotedBulkActions={priceActions}
                  primaryAction={{
                    content: "Add Pricing",
                    action: () => {
                      console.log("clicked");
                    },
                  }}
                >
                  {pricingMarkup}
                </IndexTable>
              )}
            </LegacyCard>
          </Grid.Cell>
          <Grid.Cell columnSpan={{ xs: 12, lg: 6 }}>
            <LegacyCard>
              {papers.length == 0 && (
                <EmptyState
                  heading="Select Paper Type Group"
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                  action={{
                    content: "Add Paper Type",
                    icon: CashDollarMinor,
                    onAction: () => {
                      setPaperModal(true);
                    },
                  }}
                >
                  {/* <p>Choose Paper Type Group</p> */}
                </EmptyState>
              )}
              {papers.length > 0 && (
                <IndexTable
                  resourceName={paperResourceName}
                  itemCount={papers.length}
                  selectedItemsCount={
                    paperAllResourcesSelected
                      ? "All"
                      : paperSelectedResoucrce.length
                  }
                  headings={[{ title: "Name" }, { title: "Count" }]}
                  onSelectionChange={handlePaperSelectionChange}
                  // promotedBulkActions={priceActions}
                  primaryAction={{
                    content: "Add Paper Type Group",
                    action: () => {
                      console.log("clicked");
                    },
                  }}
                >
                  {papersMarkup}
                </IndexTable>
              )}
            </LegacyCard>
          </Grid.Cell>
          <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
            <TextField
              label="Enter Min Width"
              type="number"
              value={minWidth}
              onChange={handleChangeMinWidth}
              autoComplete="off"
            />
          </Grid.Cell>
          <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
            <TextField
              label="Enter Max Width"
              type="number"
              value={maxWidth}
              onChange={handleChangeMaxWidth}
              autoComplete="off"
            />
          </Grid.Cell>
          <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
            <TextField
              label="Enter Min Height"
              type="number"
              value={minHeight}
              onChange={handleChangeMinHeight}
              autoComplete="off"
            />
          </Grid.Cell>
          <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
            <TextField
              label="Enter Max Height"
              type="number"
              value={maxHeight}
              onChange={handleChangeMaxHeight}
              autoComplete="off"
            />
          </Grid.Cell>
        </Grid>
      </Page>
    </Frame>
  );
};

export default CreateCalculator;
