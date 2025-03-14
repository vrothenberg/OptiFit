import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    paddingVertical: 8,
  },
  loadingIndicator: {
    marginHorizontal: 8,
  },
  filtersButton: {
    padding: 8,
  },
  suggestionsList: {
    maxHeight: 200,
    borderWidth: 1,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    marginTop: -1,
    zIndex: 1,
  },
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  resultsList: {
    maxHeight: 400,
    marginTop: 8,
    borderRadius: 8,
  },
  resultItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  resultContent: {
    flex: 1,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  foodName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    marginLeft: 4,
  },
  brandText: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 4,
  },
  foodDetails: {
    fontSize: 14,
    marginVertical: 4,
  },
  labelsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  labelWrapper: {
    marginRight: 8,
    marginBottom: 8,
  },
  labelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  labelText: {
    fontSize: 12,
    fontWeight: '500',
  },
  moreLabelsText: {
    fontSize: 12,
    color: '#757575',
    alignSelf: 'center',
  },
  resultActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  nutritionButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  nutritionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#555555',
  },
  noResults: {
    padding: 16,
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingBottom: 30,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  filtersScrollView: {
    marginTop: 16,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  labelsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  filterLabelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  filterLabelText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 16,
  },
  footerButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButton: {
    backgroundColor: '#f0f0f0',
  },
  resetButtonText: {
    color: '#555555',
    fontWeight: '500',
  },
  applyButton: {
    backgroundColor: '#2196F3',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  nutritionLoading: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nutritionScrollView: {
    paddingHorizontal: 16,
  },
  nutritionHeader: {
    marginTop: 16,
    marginBottom: 16,
  },
  nutritionFoodName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  nutritionBrand: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  foodImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  nutritionDetails: {
    marginTop: 16,
  },
  nutritionSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  nutrientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  nutrientName: {
    fontSize: 14,
  },
  nutrientValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  measureText: {
    fontSize: 14,
    marginBottom: 4,
  },
  nutritionLabelsContainer: {
    marginTop: 16,
  },
  nutritionLabelsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  nutritionLabelWrapper: {
    marginRight: 8,
    marginBottom: 8,
  },
});
